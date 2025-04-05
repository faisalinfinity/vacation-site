"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchAvailableProducts() {
      try {
        const res = await fetch("/api/products/available");
        if (!res.ok) {
          throw new Error("Failed to fetch available products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchAvailableProducts();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="mb-2 text-3xl font-bold">Discover weekend getaways</h1>
      <p className="mb-8 text-gray-600">
        Showing deals for: This Month
      </p>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product._id}`}>
            <div className="cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition p-4 bg-white">
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.title}
                className="w-full h-48 object-cover rounded"
              />
              <div className="mt-3">
                <h2 className="text-xl font-semibold truncate">
                  {product.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {product.description}
                </p>
                <p className="mt-2 font-bold text-lg">${product.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
