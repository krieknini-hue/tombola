import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function parseKeyJson(envName: string, keyName: string): string {
  const raw = Deno.env.get(envName);
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.[keyName] === "string" ? parsed[keyName] : "";
  } catch {
    return "";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey =
    parseKeyJson("SUPABASE_SECRET_KEYS", "default") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    "";
  const clientKey =
    parseKeyJson("SUPABASE_PUBLISHABLE_KEYS", "default") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "";

  if (!supabaseUrl || !serviceKey || !clientKey) {
    return jsonResponse({ error: "Configuration serveur incomplète." }, 500);
  }

  let candidate = "";
  try {
    const payload = await req.json();
    candidate = typeof payload?.code === "string" ? payload.code : "";
  } catch {
    return jsonResponse({ error: "Requête JSON invalide." }, 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authEmail, error: rpcError } = await supabaseAdmin.rpc(
    "verify_collective_code",
    { candidate },
  );

  if (rpcError || typeof authEmail !== "string" || !authEmail) {
    await sleep(300);
    return jsonResponse({ error: "Code collectif incorrect." }, 401);
  }

  let linkRes = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: authEmail,
  });

  if (linkRes.error) {
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      app_metadata: { collective: "tombola", role: "collective_member" },
    });
    if (createErr) {
      return jsonResponse({ error: "Impossible d'initialiser la session collective." }, 500);
    }
    linkRes = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: authEmail,
    });
  }

  if (linkRes.error || !linkRes.data?.user) {
    return jsonResponse({ error: "Impossible de générer la session." }, 500);
  }

  const user = linkRes.data.user;
  if (user.app_metadata?.collective !== "tombola") {
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...(user.app_metadata ?? {}),
        collective: "tombola",
        role: "collective_member",
      },
    });
    if (updErr) {
      return jsonResponse({ error: "Impossible de mettre à jour les droits du collectif." }, 500);
    }
    linkRes = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: authEmail,
    });
  }

  const hashedToken = linkRes.data?.properties?.hashed_token;
  if (!hashedToken) {
    return jsonResponse({ error: "Jeton de session indisponible." }, 500);
  }

  const supabaseClient = createClient(supabaseUrl, clientKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: otpData, error: otpError } = await supabaseClient.auth.verifyOtp({
    token_hash: hashedToken,
    type: "magiclink",
  });

  if (otpError || !otpData?.session?.access_token || !otpData?.session?.refresh_token) {
    return jsonResponse({ error: "Validation de session refusée." }, 500);
  }

  return jsonResponse(
    {
      access_token: otpData.session.access_token,
      refresh_token: otpData.session.refresh_token,
    },
    200,
  );
});
