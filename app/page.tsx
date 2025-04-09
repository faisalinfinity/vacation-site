"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import FeaturedSection from "@/components/featured-section"
import Footer from "@/components/footer"
import { Calendar, MapPin, Star } from "lucide-react"

type Product = {
  _id: string
  title: string
  description?: string
  price: number
  images: string[]
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function fetchAvailableProducts() {
      try {
        const res = await fetch("/api/products/available")
        if (!res.ok) {
          throw new Error("Failed to fetch available products")
        }
        const data = await res.json()
        setProducts(data)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchAvailableProducts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <FeaturedSection />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Discover weekend getaways</h2>
            <p className="text-gray-600 mt-2">Showing deals for: This Month</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product._id} href={`/products/${product._id}`}>
                <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.svg?height=400&width=600"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Popular location</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                      {product.description ||
                        "Experience this amazing getaway destination with all the amenities you need."}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Available now</span>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                      <p className="font-bold text-lg text-teal-700">
                        ${product.price}
                        <span className="text-sm font-normal text-gray-500">/night</span>
                      </p>
                      <span className="text-sm text-teal-600 font-medium">View Details</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
