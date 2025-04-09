"use client"

import { useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import InventoryManagement from "@/components/inventory-management"
import { useEffect, useState } from "react"

type Product = {
  _id: string
  title: string
}

export default function ProductInventoryPage() {
  const params = useParams() as { id: string }
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data)
        }
      } catch (error) {
        console.error("Error fetching product details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductDetails()
  }, [params.id])

  return (
    <DashboardLayout title="Manage Availability">
      <div className="mb-6">
        <Link href="/dashboard" className="text-teal-600 hover:text-teal-700 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>
            {isLoading ? "Loading..." : product ? `Manage Availability: ${product.title}` : "Property Not Found"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-2">
            Set which dates your property is available for booking. Guests will only be able to book on dates marked as
            available.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-teal-500 mr-1"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryManagement productId={params.id} />
    </DashboardLayout>
  )
}
