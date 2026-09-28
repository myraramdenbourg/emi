// Newsletter signup → Shopify customer list, via the owner's "Echoes Newsletter"
// Dev Dashboard app using the client credentials grant. Credentials and tokens
// never leave this function and are never logged.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API_VERSION = "2025-07";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

let cached: { token: string; expiresAt: number } | null = null;

function shopDomain() {
  const raw = (Deno.env.get("SHOPIFY_STORE_DOMAIN") ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(raw)) throw new ConfigError("SHOPIFY_STORE_DOMAIN must look like your-store.myshopify.com");
  return raw;
}
class ConfigError extends Error {}
class ShopifyError extends Error {
  constructor(public step: string, public status: number, public details: unknown) { super(step); }
}

async function getToken(force = false) {
  // Renew 5 minutes before the 24-hour expiry.
  if (!force && cached && Date.now() < cached.expiresAt - 5 * 60_000) return cached.token;
  const id = Deno.env.get("SHOPIFY_CLIENT_ID"), secret = Deno.env.get("SHOPIFY_CLIENT_SECRET");
  if (!id || !secret) throw new ConfigError("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET are not set");
  const res = await fetch(`https://${shopDomain()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  const text = await res.text();
  let body: any; try { body = JSON.parse(text); } catch { body = text.slice(0, 500); }
  if (!res.ok || !body?.access_token) throw new ShopifyError("token", res.status, body?.error_description ?? body?.error ?? body);
  const scopes = String(body.scope ?? "");
  if (!scopes.split(",").map((s) => s.trim()).includes("write_customers")) {
    throw new ShopifyError("token_scope", 403, `Token granted scopes "${scopes}" — write_customers is missing`);
  }
  cached = { token: body.access_token, expiresAt: Date.now() + (Number(body.expires_in) || 86_399) * 1000 };
  return cached.token;
}

async function gql(query: string, variables: Record<string, unknown>, retried = false): Promise<any> {
  const token = await getToken();
  const res = await fetch(`https://${shopDomain()}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 401 && !retried) { cached = null; return gql(query, variables, true); }
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.errors) throw new ShopifyError("graphql", res.status, body?.errors ?? body);
  return body.data;
}

const consent = () => ({
  marketingState: "SUBSCRIBED",
  marketingOptInLevel: "SINGLE_OPT_IN",
  consentUpdatedAt: new Date().toISOString(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let email = "";
  try { const b = await req.json(); email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : ""; } catch { /* fallthrough */ }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) return json({ error: "invalid_email" }, 400);

  try {
    const found = await gql(
      `query($q: String!) { customers(first: 1, query: $q) { edges { node { id email emailMarketingConsent { marketingState } } } } }`,
      { q: `email:"${email.replace(/"/g, "")}"` },
    );
    const existing = found.customers.edges.map((e: any) => e.node).find((n: any) => n.email?.toLowerCase() === email);

    if (existing) {
      if (existing.emailMarketingConsent?.marketingState === "SUBSCRIBED") return json({ status: "duplicate" });
      const r = await gql(
        `mutation($input: CustomerEmailMarketingConsentUpdateInput!) { customerEmailMarketingConsentUpdate(input: $input) { customer { id emailMarketingConsent { marketingState } } userErrors { field message } } }`,
        { input: { customerId: existing.id, emailMarketingConsent: consent() } },
      );
      const p = r.customerEmailMarketingConsentUpdate;
      if (p.userErrors.length) throw new ShopifyError("consent_update", 422, p.userErrors);
      if (p.customer?.emailMarketingConsent?.marketingState !== "SUBSCRIBED") throw new ShopifyError("consent_update", 422, "Consent not confirmed");
      return json({ status: "resubscribed" });
    }

    const r = await gql(
      `mutation($input: CustomerInput!) { customerCreate(input: $input) { customer { id emailMarketingConsent { marketingState } } userErrors { field message } } }`,
      { input: { email, tags: ["echoes-of-the-market"], emailMarketingConsent: consent() } },
    );
    const p = r.customerCreate;
    if (p.userErrors.length) {
      if (p.userErrors.some((e: any) => /taken/i.test(e.message))) return json({ status: "duplicate" });
      throw new ShopifyError("customer_create", 422, p.userErrors);
    }
    if (!p.customer?.id) throw new ShopifyError("customer_create", 500, "No customer returned");
    return json({ status: "created" });
  } catch (e) {
    if (e instanceof ConfigError) { console.error("shopify-signup config:", e.message); return json({ error: "not_configured", details: e.message }, 503); }
    if (e instanceof ShopifyError) {
      console.error(`shopify-signup ${e.step} failed [${e.status}]:`, JSON.stringify(e.details).slice(0, 800));
      return json({ error: "shopify_error", step: e.step, status: e.status, details: e.details }, 502);
    }
    console.error("shopify-signup unexpected:", e instanceof Error ? e.message : "unknown");
    return json({ error: "unexpected" }, 500);
  }
});
