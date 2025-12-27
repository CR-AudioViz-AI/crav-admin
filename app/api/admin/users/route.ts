import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all users with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tier = searchParams.get("tier") || "";

    let query = supabase
      .from("user_profiles")
      .select(`
        *,
        user_subscriptions(plan_id, status, current_period_end),
        user_credits(balance, lifetime_earned)
      `, { count: "exact" })
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (tier) {
      query = query.eq("subscription_tier", tier);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create user or perform bulk action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userIds, data } = body;

    if (action === "bulk_update") {
      const { error } = await supabase
        .from("user_profiles")
        .update(data)
        .in("id", userIds);
      if (error) throw error;
      return NextResponse.json({ success: true, updated: userIds.length });
    }

    if (action === "bulk_delete") {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .in("id", userIds);
      if (error) throw error;
      return NextResponse.json({ success: true, deleted: userIds.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update single user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}