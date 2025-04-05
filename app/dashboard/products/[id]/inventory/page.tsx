"use client";

import React from "react";
import { useParams } from "next/navigation";
import InventoryManagement from "@/components/InventoryManagement";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductInventoryPage() {
  const params = useParams() as { id: string };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">
        Manage Inventory for Product {params.id}
      </h1>
      <InventoryManagement productId={params.id} />
      <div className="mt-4">
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
