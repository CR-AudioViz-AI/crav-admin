import { NextResponse } from "next/server";
import Stripe from "stripe";

// Authorization check
function isAuthorized(request: Request): boolean {
  // TODO: Implement proper admin auth check
  return true;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
});

// GET - List subscriptions with filters
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "100");
  const starting_after = searchParams.get("starting_after");

  try {
    const params: Stripe.SubscriptionListParams = {
      limit,
      expand: ["data.customer", "data.default_payment_method"],
    };

    if (status && status !== "all") {
      params.status = status as Stripe.SubscriptionListParams["status"];
    }
    if (starting_after) {
      params.starting_after = starting_after;
    }

    const subscriptions = await stripe.subscriptions.list(params);

    // Calculate summary stats
    const activeCount = subscriptions.data.filter(
      (s) => s.status === "active"
    ).length;
    const mrr = subscriptions.data
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const amount = s.items.data[0]?.price?.unit_amount || 0;
        const interval = s.items.data[0]?.price?.recurring?.interval;
        if (interval === "year") return sum + amount / 12;
        return sum + amount;
      }, 0);

    return NextResponse.json({
      subscriptions: subscriptions.data,
      has_more: subscriptions.has_more,
      summary: {
        total: subscriptions.data.length,
        active: activeCount,
        mrr: mrr / 100, // Convert to dollars
      },
    });
  } catch (error) {
    console.error("Stripe subscriptions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST - Create a subscription
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customerId, priceId, trialDays, metadata } = body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      metadata,
      expand: ["latest_invoice.payment_intent"],
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subscription
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscriptionId, priceId, cancel_at_period_end, metadata } = body;

    const updateParams: Stripe.SubscriptionUpdateParams = {};
    
    if (priceId) {
      updateParams.items = [{ price: priceId }];
    }
    if (cancel_at_period_end !== undefined) {
      updateParams.cancel_at_period_end = cancel_at_period_end;
    }
    if (metadata) {
      updateParams.metadata = metadata;
    }

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a subscription
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get("id");
  const immediate = searchParams.get("immediate") === "true";

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Subscription ID required" },
      { status: 400 }
    );
  }

  try {
    let subscription;
    
    if (immediate) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
