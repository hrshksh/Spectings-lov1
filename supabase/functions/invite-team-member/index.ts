import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const ALLOWED_ORIGINS = [
  "https://alllbrackets.lovable.app",
  "https://id-preview--81afc344-6a57-41a1-b602-3bed2702e2e1.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify caller identity
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;
    const callerEmail = claimsData.claims.email as string;

    const { email, organization_id, organization_name } = await req.json();
    if (!email || !organization_id) {
      return new Response(JSON.stringify({ error: "Email and organization_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller is a member of the org
    const { data: membership } = await adminClient
      .from("organization_members")
      .select("id")
      .eq("organization_id", organization_id)
      .eq("user_id", callerId)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "You are not a member of this organization" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // FIX #4: Check caller has customer_admin or higher role
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const adminRoles = ["super_admin", "researcher", "analyst", "qc", "customer_admin"];
    const hasAdminRole = callerRoles?.some((r) => adminRoles.includes(r.role));
    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Only team administrators can invite members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      // Check if already in THIS org
      const { data: existingMember } = await adminClient
        .from("organization_members")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("user_id", existingProfile.id)
        .maybeSingle();
      if (existingMember) {
        // FIX #10: Generic error - don't reveal org membership details
        return new Response(JSON.stringify({ error: "Unable to invite this user. They may already be a member." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user belongs to ANOTHER org
      const { data: otherOrg } = await adminClient
        .from("organization_members")
        .select("id")
        .eq("user_id", existingProfile.id)
        .neq("organization_id", organization_id)
        .maybeSingle();
      if (otherOrg) {
        // FIX #10: Generic error - don't reveal cross-org info
        return new Response(JSON.stringify({ error: "Unable to invite this user. They may already be a member." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add existing user directly to the org
      const { error: addErr } = await adminClient
        .from("organization_members")
        .insert({ organization_id, user_id: existingProfile.id });
      if (addErr) throw addErr;

      const { data: existingRole } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", existingProfile.id)
        .maybeSingle();
      if (!existingRole) {
        await adminClient.from("user_roles").insert({ user_id: existingProfile.id, role: "customer_user" });
      }

      return new Response(JSON.stringify({ status: "added", message: "User added to team" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user account directly (no invite email)
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        org_id: organization_id,
        org_name: organization_name || "your team",
        invited_by: callerEmail,
      },
    });
    if (createErr) throw createErr;

    // Pre-create org membership
    if (newUser?.user?.id) {
      await adminClient.from("organization_members").insert({
        organization_id,
        user_id: newUser.user.id,
      });
    }

    // Send password reset email so the new user can set their password
    const { error: resetErr } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    if (resetErr) {
      console.error("Failed to send password reset email:", resetErr.message);
    }

    return new Response(
      JSON.stringify({ status: "created", message: "User added. A password setup email has been sent." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
