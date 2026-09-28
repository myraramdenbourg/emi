import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOP_DOMAIN = "vj5a4z-91.myshopify.com";
const API_VERSION = "2025-07";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    const v = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || v.length > 255) {
      return new Response(JSON.stringify({ error: "invalid_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN is not configured");

    const res = await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/customers.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        customer: {
          email: v,
          tags: "echoes-of-the-market",
          email_marketing_consent: {
            state: "subscribed",
            opt_in_level: "single_opt_in",
            consent_updated_at: new Date().toISOString(),
          },
        },
      }),
    });

    if (res.status === 422) {
      const body = await res.text();
      if (body.toLowerCase().includes("taken")) {
        // Already a customer — make sure they're subscribed to marketing.
        const search = await fetch(
          `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/customers/search.json?query=${encodeURIComponent(`email:${v}`)}`,
          { headers: { "X-Shopify-Access-Token": token } },
        );
        if (search.ok) {
          const found = await search.json();
          const existing = found?.customers?.[0];
          if (existing?.id && existing?.email_marketing_consent?.state !== "subscribed") {
            await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/customers/${existing.id}.json`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
              body: JSON.stringify({
                customer: {
                  id: existing.id,
                  email_marketing_consent: {
                    state: "subscribed",
                    opt_in_level: "single_opt_in",
                    consent_updated_at: new Date().toISOString(),
                  },
                },
              }),
            });
          }
        }
        return new Response(JSON.stringify({ status: "duplicate" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error(`Shopify 422: ${body}`);
      return new Response(JSON.stringify({ status: "saved_locally", shopify_status: 422 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!res.ok) {
      const body = await res.text();
      console.error(`Shopify customer create failed [${res.status}]: ${body}`);
      // Don't fail the player's signup: the site keeps its own copy of the email.
      return new Response(JSON.stringify({ status: "saved_locally", shopify_status: res.status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "created" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("shopify-signup error:", err);
    return new Response(JSON.stringify({ error: "unexpected", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
