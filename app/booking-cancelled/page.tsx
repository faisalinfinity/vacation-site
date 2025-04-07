"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BookingCancelledPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Booking Cancelled</h1>
      <p className="text-lg">Your booking was cancelled. Please try again.</p>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => router.push("/")}
      >
        Return Home
      </button>
    </div>
  );
}
