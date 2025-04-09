"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, MapPin, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Product = {
  _id: string
  title: string
  description?: string
  price: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string>("")
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    // If token is missing, redirect to login
    if (!token) {
      router.push("/auth/login")
    } else {
      fetchProducts()
    }
  }, [token, router])

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await res.json()
      setProducts(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(productId: string) {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product")
      }
      // Refresh list after deletion
      fetchProducts()
      setProductToDelete(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <DashboardLayout title="Provider Dashboard">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Properties</h1>
          <p className="text-gray-500 mt-1">Manage your vacation rental listings</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/dashboard/products/new">
            <Button className="bg-teal-600 hover:bg-teal-700">Add New Property</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-teal-100 p-3 mb-4">
              <MapPin className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No properties yet</h3>
            <p className="text-gray-500 mb-4">Add your first property to start receiving bookings</p>
            <Link href="/dashboard/products/new">
              <Button className="bg-teal-600 hover:bg-teal-700">Add Your First Property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">Active</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {product.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-teal-700">
                    ${product.price}
                    <span className="text-sm font-normal text-gray-500">/night</span>
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Manage dates</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/products/${product._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/products/${product._id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/products/${product._id}/inventory`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-1" />
                      Dates
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setProductToDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this property and all associated data. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => productToDelete && handleDelete(productToDelete)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
