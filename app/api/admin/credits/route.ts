import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get user credits and transaction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (userId) {
      // Get single user credits
      const { data: credits, error: creditsError } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: transactions, error: txError } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (creditsError) throw creditsError;

      return NextResponse.json({ credits, transactions });
    }

    // Get all users with low credits
    const { data, count, error } = await supabase
      .from("user_credits")
      .select(`
        *,
        user_profiles(email, display_name)
      `, { count: "exact" })
      .lt("balance", 100)
      .range((page - 1) * limit, page * limit - 1)
      .order("balance", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adjust user credits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, reason, type = "admin_adjustment" } = body;

    // Get current balance
    const { data: current, error: fetchError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (current?.balance || 0) + amount;
    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Cannot reduce below 0" },
        { status: 400 }
      );
    }

    // Update balance
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        balance: newBalance,
        lifetime_earned: amount > 0 
          ? supabase.rpc("increment_lifetime", { amount })
          : undefined,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    // Log transaction
    const { error: logError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount,
        type,
        description: reason || `Admin adjustment: ${amount > 0 ? "+" : ""}${amount} credits`,
        balance_after: newBalance
      });

    if (logError) console.error("Transaction log error:", logError);

    return NextResponse.json({
      success: true,
      previousBalance: current?.balance || 0,
      newBalance,
      adjustment: amount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Bulk credit adjustment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, amount, reason } = body;

    const results = [];
    for (const userId of userIds) {
      const { data: current } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();

      const newBalance = Math.max(0, (current?.balance || 0) + amount);

      await supabase
        .from("user_credits")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount,
          type: "bulk_admin_adjustment",
          description: reason || `Bulk admin adjustment`,
          balance_after: newBalance
        });

      results.push({ userId, newBalance });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}