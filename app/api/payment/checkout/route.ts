// /app/api/payment/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";

// Initialize Stripe using your secret key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Extract required details from the request body
    const { product, guestName, guestEmail, checkIn, checkOut, amount } =
      await request.json();

    // Create a new Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round((amount + 60) * 100), // amount in cents
            product_data: {
              name: `Booking for product ${product}`,
              description: `Booking from ${checkIn.split("T")[0]} to ${
                checkOut.split("T")[0]
              }`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}&product=${product}&checkIn=${checkIn}&checkOut=${checkOut}&guestName=${guestName}&guestEmail=${guestEmail}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-cancelled`,
      customer_email: guestEmail,
      metadata: {
        guestName,
        product,
        checkIn,
        checkOut,
        guestEmail,
      },
    });

    return NextResponse.json({ sessionUrl: session.url }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
