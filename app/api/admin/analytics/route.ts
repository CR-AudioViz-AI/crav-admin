import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const metric = searchParams.get("metric") || "all";

    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const analytics: Record<string, any> = {};

    // Revenue metrics
    if (metric === "all" || metric === "revenue") {
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, status, created_at, payment_type")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed");

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const subscriptionRevenue = payments?.filter(p => p.payment_type === "subscription")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const creditRevenue = payments?.filter(p => p.payment_type === "credits")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      analytics.revenue = {
        total: totalRevenue,
        subscription: subscriptionRevenue,
        credits: creditRevenue,
        transactionCount: payments?.length || 0,
        avgTransactionValue: payments?.length ? totalRevenue / payments.length : 0
      };
    }

    // User metrics
    if (metric === "all" || metric === "users") {
      const { count: totalUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      const { count: newUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString());

      const { count: activeUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_active", startDate.toISOString());

      const { data: tierBreakdown } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .not("subscription_tier", "is", null);

      const tiers: Record<string, number> = {};
      tierBreakdown?.forEach(u => {
        tiers[u.subscription_tier] = (tiers[u.subscription_tier] || 0) + 1;
      });

      analytics.users = {
        total: totalUsers || 0,
        new: newUsers || 0,
        active: activeUsers || 0,
        tierBreakdown: tiers
      };
    }

    // Subscription metrics
    if (metric === "all" || metric === "subscriptions") {
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("status, plan_id, created_at");

      const active = subs?.filter(s => s.status === "active").length || 0;
      const canceled = subs?.filter(s => s.status === "canceled").length || 0;
      const pastDue = subs?.filter(s => s.status === "past_due").length || 0;

      const planBreakdown: Record<string, number> = {};
      subs?.filter(s => s.status === "active").forEach(s => {
        planBreakdown[s.plan_id] = (planBreakdown[s.plan_id] || 0) + 1;
      });

      analytics.subscriptions = {
        active,
        canceled,
        pastDue,
        churnRate: active > 0 ? (canceled / (active + canceled)) * 100 : 0,
        planBreakdown
      };
    }

    // Credit usage metrics
    if (metric === "all" || metric === "credits") {
      const { data: txns } = await supabase
        .from("credit_transactions")
        .select("amount, type, created_at")
        .gte("created_at", startDate.toISOString());

      const consumed = txns?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
      const purchased = txns?.filter(t => t.type === "purchase")
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      const granted = txns?.filter(t => t.type === "admin_adjustment" && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      analytics.credits = {
        consumed,
        purchased,
        granted,
        netChange: purchased + granted - consumed
      };
    }

    // Daily breakdown for charts
    if (metric === "all" || metric === "daily") {
      const { data: dailyPayments } = await supabase
        .from("payments")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      const dailyRevenue: Record<string, number> = {};
      dailyPayments?.forEach(p => {
        const date = new Date(p.created_at).toISOString().split("T")[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + p.amount;
      });

      analytics.daily = Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        revenue: amount
      }));
    }

    // MRR calculation
    const { data: activeSubs } = await supabase
      .from("user_subscriptions")
      .select("plan_id")
      .eq("status", "active");

    const planPrices: Record<string, number> = {
      free: 0, starter: 9.99, pro: 29.99, enterprise: 99.99
    };

    const mrr = activeSubs?.reduce((sum, s) => 
      sum + (planPrices[s.plan_id] || 0), 0) || 0;

    analytics.mrr = mrr;
    analytics.arr = mrr * 12;
    analytics.period = period;
    analytics.generatedAt = new Date().toISOString();

    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}