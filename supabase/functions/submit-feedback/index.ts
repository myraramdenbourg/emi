import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const REACTIONS = ["loved", "liked", "okay", "not"] as const;
const Body = z.object({
  id: z.string().uuid().optional(),
  token: z.string().min(20).max(100),
  reaction: z.enum(REACTIONS).nullable().optional(),
  message: z.string().max(2000).optional(),
  email: z.string().trim().max(255).email().optional().or(z.literal("")),
  website: z.string().max(200).optional(), // honeypot
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const sha = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))))
    .map((b) => b.toString(16).padStart(2, "0")).join("");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: "invalid", fields: parsed.error.flatten().fieldErrors }, 400);
  const { id, token, reaction, message, email, website } = parsed.data;

  // Honeypot: pretend success, store nothing.
  if (website) return json({ ok: true, id: id ?? crypto.randomUUID() });

  const msg = message?.trim();
  if (message !== undefined && !msg) return json({ error: "empty_message" }, 400);
  if (!id && !reaction && !msg) return json({ error: "nothing_to_save" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha(`eotm-feedback:${ip}`);

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db.from("feedback").select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("updated_at", since);
  if ((count ?? 0) >= 30) return json({ error: "rate_limited" }, 429);

  const tokenHash = await sha(token);
  const fields: Record<string, unknown> = { updated_at: new Date().toISOString(), ip_hash: ipHash };
  if (reaction !== undefined) fields.reaction = reaction;
  if (msg) { fields.message = msg; fields.contact_email = email ? email.toLowerCase() : null; }

  if (id) {
    const { data, error } = await db.from("feedback").update(fields)
      .eq("id", id).eq("edit_token_hash", tokenHash).select("id").maybeSingle();
    if (error) { console.error("feedback update failed", error.code); return json({ error: "save_failed" }, 500); }
    if (data) return json({ ok: true, id: data.id });
    // Unknown id/token → fall through and create a fresh record.
  }
  const { data, error } = await db.from("feedback").insert({ ...fields, edit_token_hash: tokenHash }).select("id").single();
  if (error) { console.error("feedback insert failed", error.code); return json({ error: "save_failed" }, 500); }
  return json({ ok: true, id: data.id });
});
