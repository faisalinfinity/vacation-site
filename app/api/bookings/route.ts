// /app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Product from "@/models/Product";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { product, guestName, guestEmail, checkIn, checkOut } = body;

    if (!product || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
    }

    // Verify that the product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const booking = await Booking.create({
      product,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      status: "confirmed",
    });

    // Set up nodemailer transporter using SMTP credentials from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: guestEmail,
      subject: "Booking Confirmation",
      text: `Hi ${guestName}, your booking for product ${existingProduct.title} from ${checkIn} to ${checkOut} has been confirmed.`,
    });

    return NextResponse.json({ message: "Booking confirmed and email sent", booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
