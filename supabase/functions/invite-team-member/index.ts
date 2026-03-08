import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with caller's token to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      .eq("user_id", caller.id)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "You are not a member of this organization" }), {
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
      // Check if already a member
      const { data: existingMember } = await adminClient
        .from("organization_members")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("user_id", existingProfile.id)
        .maybeSingle();
      if (existingMember) {
        return new Response(JSON.stringify({ error: "This user is already a team member" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add existing user directly
      const { error: addErr } = await adminClient
        .from("organization_members")
        .insert({ organization_id, user_id: existingProfile.id });
      if (addErr) throw addErr;

      return new Response(JSON.stringify({ status: "added", message: "Existing user added to team" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // User doesn't exist — send invite via Supabase Auth
    const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        org_id: organization_id,
        org_name: organization_name || "your team",
        invited_by: caller.email,
      },
    });
    if (inviteErr) throw inviteErr;

    // Pre-create the org membership so when they confirm, they're already in the org
    if (inviteData?.user?.id) {
      await adminClient.from("organization_members").insert({
        organization_id,
        user_id: inviteData.user.id,
      });
    }

    return new Response(
      JSON.stringify({ status: "invited", message: "Invitation email sent" }),
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
