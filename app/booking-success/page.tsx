import BookingSuccessPage from "@/components/booking-confirm";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <BookingSuccessPage />
    </Suspense>
  );
}
