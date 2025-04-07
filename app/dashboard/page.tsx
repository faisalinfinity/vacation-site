"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    // If token is missing, redirect to login
    if (!token) {
      router.push("/auth/login");
    } else {
      fetchProducts();
    }
  }, [token]);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(productId: string) {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }
      // Refresh list after deletion
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="mb-4 text-3xl font-bold">Provider Dashboard</h1>
      <div className="mb-6">
        <Link href="/dashboard/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product._id} className="p-4">
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{product.description}</p>
              <p className="mt-2 font-bold">${product.price}</p>
            </CardContent>
            <div className="flex justify-end gap-2">
              <Link href={`/dashboard/products/${product._id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Link href={`/dashboard/products/${product._id}/inventory`}>
                <Button variant="outline" size="sm">
                  Manage Inventory
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
