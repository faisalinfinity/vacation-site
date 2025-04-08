"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  const uploadToCloudinary = async () => {
    setUploading(true);
    const uploadedURLs: string[] = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.secure_url) {
          uploadedURLs.push(data.secure_url);
        } else {
          throw new Error("Image upload failed");
        }
      } catch (err) {
        console.error(err);
        setError("Image upload failed");
        setUploading(false);
        return [];
      }
    }

    setUploading(false);
    setImageURLs(uploadedURLs);
    return uploadedURLs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    const uploadedImageURLs = await uploadToCloudinary();
    if (uploadedImageURLs.length === 0) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price,
          images: uploadedImageURLs,
          inventory: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add product");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto p-4">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading Images..." : "Add Product"}
            </Button>
          </form>
          {imageURLs.length > 0 && (
            <div className="mt-4">
              <Label className="block mb-2">Uploaded Previews:</Label>
              <div className="grid grid-cols-3 gap-2">
                {imageURLs.map((url, i) => (
                  <img key={i} src={url} alt={`Uploaded ${i}`} className="w-full h-20 object-cover" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
