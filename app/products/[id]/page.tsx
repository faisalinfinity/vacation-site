"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the product type and inventory type
type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  inventory: { date: string; available: boolean }[];
};

export default function ProductDetailsPage() {
  const params = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  // Set of available dates in "YYYY-MM-DD" format
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());

  // Fetch product details
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data);

        // Build a set of available dates from the inventory array.
        const availSet = new Set<string>();
        data.inventory.forEach((inv: { date: string; available: boolean }) => {
          if (inv.available) {
            const dateStr = new Date(inv.date).toISOString().split("T")[0];
            availSet.add(dateStr);
          }
        });
        setAvailableDatesSet(availSet);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchProduct();
  }, [params.id]);

  // Helper: Check if a single date is available
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return availableDatesSet.has(dateStr);
  };

  // Helper: Generate all dates from start (inclusive) to end (exclusive)
  const getDatesInRange = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    while (current < end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Custom filter for the DatePicker: only allow available dates.
  const filterAvailableDate = (date: Date): boolean => isDateAvailable(date);

  // Booking submission
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setBookingMessage("");

    // Basic validations: required fields and check-in before check-out.
    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      setBookingMessage("Please fill in all fields.");
      return;
    }
    if (checkIn >= checkOut) {
      setBookingMessage("Check-out date must be after check-in date.");
      return;
    }

    // Validate that all dates from checkIn to checkOut (nights booked) are available.
    const datesToCheck = getDatesInRange(checkIn, checkOut);
    const unavailableDates = datesToCheck.filter((d) => !availableDatesSet.has(d));
    if (unavailableDates.length > 0) {
      setBookingMessage(
        `The following dates are not available: ${unavailableDates.join(", ")}`
      );
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product?._id,
          guestName,
          guestEmail,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingMessage(data.error || "Booking failed.");
      } else {
        setBookingMessage("Booking successful! Confirmation email sent.");
      }
    } catch (err: any) {
      setBookingMessage(err.message);
    }
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }
  if (!product) {
    return <p className="p-8">Loading product details...</p>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Product Images */}
        {product.images && product.images.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={product.title}
                className="w-64 h-48 object-cover rounded"
              />
            ))}
          </div>
        ) : (
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center rounded">
            No Images
          </div>
        )}

        {/* Product Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="mt-2 text-gray-600">{product.description}</p>
          <p className="mt-4 font-semibold text-xl">${product.price}</p>
        </div>

        {/* Display Available Dates */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Available Dates</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(availableDatesSet).map((dateStr, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                {new Date(dateStr).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Book This Rental</h2>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <Label htmlFor="checkIn" className="block mb-1">
                Check-In Date
              </Label>
              <DatePicker
                selected={checkIn}
                onChange={(date: Date) => setCheckIn(date)}
                filterDate={filterAvailableDate}
                placeholderText="Select check-in date"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <Label htmlFor="checkOut" className="block mb-1">
                Check-Out Date
              </Label>
              <DatePicker
                selected={checkOut}
                onChange={(date: Date) => setCheckOut(date)}
                filterDate={filterAvailableDate}
                placeholderText="Select check-out date"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <Label htmlFor="guestName" className="block mb-1">
                Your Name
              </Label>
              <Input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="guestEmail" className="block mb-1">
                Your Email
              </Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Book Now
            </Button>
            {bookingMessage && (
              <p className="mt-2 text-center text-green-600">{bookingMessage}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
