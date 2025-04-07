"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const product = searchParams.get("product");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guestEmail=searchParams.get('guestEmail');
  const guestName=searchParams.get('guestName')
  const [message, setMessage] = useState("Processing your booking...");

  useEffect(() => {
    async function confirmBooking() {
      if (product && checkIn && checkOut) {
        try {
          const res = await fetch("/api/bookings/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product,
              checkIn,
              checkOut,
              guestEmail,
              guestName
            }),
          });
          if (res.ok) {
            setMessage("Booking confirmed! Your selected dates have been reserved.");
          } else {
            const data = await res.json();
            setMessage(`Booking confirmed, but there was an error updating inventory: ${data.error}`);
          }
        } catch (error: any) {
          setMessage(`Error: ${error.message}`);
        }
      } else {
        setMessage("Missing booking details.");
      }
    }

    if (sessionId) {
      // Simulate a delay (or process webhook on your backend in production)
      confirmBooking();
    }
  }, [sessionId, product, checkIn, checkOut, guestEmail, guestName]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Booking Success</h1>
      <p className="text-lg">{message}</p>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => router.push("/")}
      >
        Return Home
      </button>
    </div>
  );
}
