// /app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Product from "@/models/Product";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { productId, guestName, guestEmail, checkIn, checkOut } = body;

    if (!productId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing booking details" },
        { status: 400 }
      );
    }

    // Verify that the product exists.
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create booking record.
    const booking = await Booking.create({
      product: productId,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      status: "confirmed",
    });

    // Helper function to format dates as "yyyy-MM-dd" using local time.
    const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

    // Update product inventory: mark dates between checkIn (inclusive) and checkOut (exclusive) as unavailable.
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const datesToUpdate: string[] = [];
    const current = new Date(start);

    while (current < end) {
      datesToUpdate.push(formatDate(new Date(current)));
      current.setDate(current.getDate() + 1);
    }

    product.inventory = product.inventory.map((inv) => {
      const invDate = formatDate(new Date(inv.date));
      if (datesToUpdate.includes(invDate)) {
        return { ...inv, available: false };
      }
      return inv;
    });
    await product.save();

    // Set up nodemailer transporter using SMTP credentials from environment variables.
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
      text: `Hi ${guestName}, your booking for product "${product.title}" from ${checkIn} to ${checkOut} has been confirmed.`,
    });

    return NextResponse.json(
      {
        message: "Booking confirmed, inventory updated and email sent",
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
