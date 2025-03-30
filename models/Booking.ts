// /models/Booking.ts
import mongoose, { Document, Model } from "mongoose";

export interface IBooking extends Document {
  product: mongoose.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  status: "pending" | "confirmed" | "cancelled";
}

const BookingSchema = new mongoose.Schema<IBooking>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
