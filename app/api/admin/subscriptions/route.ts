import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20"
});

// GET - List subscriptions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("user_subscriptions")
      .select(`
        *,
        user_profiles(email, display_name)
      `, { count: "exact" })
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (plan) query = query.eq("plan_id", plan);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      subscriptions: data,
      total: count,
      page,
      limit
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Admin subscription actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscriptionId, userId, data } = body;

    switch (action) {
      case "cancel": {
        // Cancel in Stripe
        const sub = await stripe.subscriptions.cancel(subscriptionId);
        
        // Update database
        await supabase
          .from("user_subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscriptionId);

        return NextResponse.json({ success: true, subscription: sub });
      }

      case "pause": {
        const sub = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: { behavior: "void" }
        });

        await supabase
          .from("user_subscriptions")
          .update({ status: "paused" })
          .eq("stripe_subscription_id", subscriptionId);

        return NextResponse.json({ success: true, subscription: sub });
      }

      case "resume": {
        const sub = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: ""
        });

        await supabase
          .from("user_subscriptions")
          .update({ status: "active" })
          .eq("stripe_subscription_id", subscriptionId);

        return NextResponse.json({ success: true, subscription: sub });
      }

      case "upgrade": {
        const { newPlanId } = data;
        const priceIds: Record<string, string> = {
          starter: process.env.STRIPE_STARTER_PRICE_ID!,
          pro: process.env.STRIPE_PRO_PRICE_ID!,
          enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
        };

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const updated = await stripe.subscriptions.update(subscriptionId, {
          items: [{
            id: sub.items.data[0].id,
            price: priceIds[newPlanId]
          }],
          proration_behavior: "create_prorations"
        });

        await supabase
          .from("user_subscriptions")
          .update({ plan_id: newPlanId })
          .eq("stripe_subscription_id", subscriptionId);

        return NextResponse.json({ success: true, subscription: updated });
      }

      case "grant_trial": {
        const { days } = data;
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + days);

        await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            plan_id: "pro",
            status: "trialing",
            trial_end: trialEnd.toISOString()
          });

        return NextResponse.json({ success: true, trialEnd });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}