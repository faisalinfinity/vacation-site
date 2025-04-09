"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { ArrowLeft, ImagePlus, Loader2, Upload } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [imageURLs, setImageURLs] = useState<string[]>([])
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(files)

      // Create preview URLs
      const previewURLs = files.map((file) => URL.createObjectURL(file))
      setImageURLs(previewURLs)
    }
  }

  const uploadToCloudinary = async () => {
    setUploading(true)
    const uploadedURLs: string[] = []

    for (const image of images) {
      const formData = new FormData()
      formData.append("file", image)
      formData.append("upload_preset", UPLOAD_PRESET || "")

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (data.secure_url) {
          uploadedURLs.push(data.secure_url)
        } else {
          throw new Error("Image upload failed")
        }
      } catch (err) {
        console.error(err)
        setError("Image upload failed")
        setUploading(false)
        return []
      }
    }

    setUploading(false)
    setImageURLs(uploadedURLs)
    return uploadedURLs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (images.length === 0) {
      setError("Please select at least one image.")
      setIsSubmitting(false)
      return
    }

    const uploadedImageURLs = await uploadToCloudinary()
    if (uploadedImageURLs.length === 0) {
      setIsSubmitting(false)
      return
    }

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
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add product")

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add New Property">
      <div className="mb-6">
        <Link href="/dashboard" className="text-teal-600 hover:text-teal-700 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base">
                      Property Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                      placeholder="e.g. Cozy Beach House with Ocean View"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 min-h-[150px]"
                      placeholder="Describe your property, amenities, location, etc."
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

                  <div>
                    <Label htmlFor="images" className="text-base">
                      Property Images
                    </Label>
                    <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center">
                        <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Click to upload images</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={uploading || isSubmitting}>
                    {(uploading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploading ? "Uploading Images..." : isSubmitting ? "Creating Property..." : "Create Property"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image Previews</h3>
              {imageURLs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {imageURLs.map((url, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden h-40">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Property preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No images uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
