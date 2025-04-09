"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

type Product = {
  _id: string
  title: string
  description?: string
  price: number
  images: string[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const [product, setProduct] = useState<Product | null>(null)
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [price, setPrice] = useState<number>(0)
  const [images, setImages] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push("/auth/login")
    } else {
      fetchProduct()
    }
  }, [token, params.id, router])

  async function fetchProduct() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/products/${params.id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch product")
      }
      const data = await res.json()
      setProduct(data)
      setTitle(data.title)
      setDescription(data.description || "")
      setPrice(data.price)
      setImages(data.images.join(", "))
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

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
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product")
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Property">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!product && !isLoading) {
    return (
      <DashboardLayout title="Edit Property">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">
            The property you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link href="/dashboard">
            <Button className="bg-teal-600 hover:bg-teal-700">Return to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Edit Property">
      <div className="mb-6">
        <Link href="/dashboard" className="text-teal-600 hover:text-teal-700 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base">
                    Property Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-base">
                    Price per Night ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <div>
                  <Label htmlFor="images" className="text-base">
                    Images (comma separated URLs)
                  </Label>
                  <Textarea
                    id="images"
                    value={images}
                    onChange={(e) => setImages(e.target.value)}
                    className="mt-1"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {product.images.map((url, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden h-40">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Updating..." : "Update Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
