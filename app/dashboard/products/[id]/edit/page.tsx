"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [images, setImages] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    } else {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.id]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }
      const data = await res.json();
      setProduct(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setPrice(data.price);
      setImages(data.images.join(", "));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price,
          images: images.split(",").map((img: string) => img.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!product) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto p-4">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="block mb-1">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="block mb-1">
                Description
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="price" className="block mb-1">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="images" className="block mb-1">
                Images (comma separated URLs)
              </Label>
              <Input
                id="images"
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Update Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
