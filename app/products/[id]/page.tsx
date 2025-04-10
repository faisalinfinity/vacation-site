"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Coffee, Home, MapPin, Wifi } from "lucide-react"

// Define the product type and inventory type
type Product = {
  _id: string
  title: string
  description?: string
  price: number
  images: string[]
  inventory: { date: string; available: boolean }[]
}

// Helper function to format a Date as "YYYY-MM-DD" in local time.
function formatDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0") // Months start at 0!
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function ProductDetailsPage() {
  const params = useParams() as { id: string }
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string>("")
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [bookingMessage, setBookingMessage] = useState("")
  const [activeImage, setActiveImage] = useState<string>("")

  // Set of available dates in "YYYY-MM-DD" format
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set())

  // Fetch product details and build available dates set
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch product")
        }
        const data = await res.json()
        setProduct(data)

        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0])
        }

        // Build a set of available dates from the inventory array using local formatting.
        const availSet = new Set<string>()
        data.inventory.forEach((inv: { date: string; available: boolean }) => {
          if (inv.available) {
            const d = new Date(inv.date)
            const dateStr = formatDate(d)
            availSet.add(dateStr)
          }
        })
        setAvailableDatesSet(availSet)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchProduct()
  }, [params.id])

  // Helper: Check if a single date is available (using local formatted date)
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = formatDate(date)
    return availableDatesSet.has(dateStr)
  }

  // Helper: Generate all dates from start (inclusive) to end (exclusive)
  const getDatesInRange = (start: Date, end: Date): string[] => {
    const dates: string[] = []
    const current = new Date(start)
    while (current < end) {
      dates.push(formatDate(new Date(current)))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Custom filter for the DatePicker: only allow available dates.
  const filterAvailableDate = (date: Date): boolean => isDateAvailable(date)

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !product) return 0

    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays * product.price
  }

  // Booking submission with Stripe integration
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    setBookingMessage("")

    // Basic validations: required fields and check-in before check-out.
    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      setBookingMessage("Please fill in all fields.")
      return
    }
    if (checkIn >= checkOut) {
      setBookingMessage("Check-out date must be after check-in date.")
      return
    }

    // Validate that all dates from checkIn to checkOut are available.
    const datesToCheck = getDatesInRange(checkIn, checkOut)
    const unavailableDates = datesToCheck.filter((d) => !availableDatesSet.has(d))
    if (unavailableDates.length > 0) {
      setBookingMessage(`The following dates are not available: ${unavailableDates.join(", ")}`)
      return
    }

    try {
      // Create a Stripe Checkout session via your backend endpoint.
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product?._id,
          guestName,
          guestEmail,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          amount: calculateTotalPrice(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookingMessage(data.error || "Booking failed.")
      } else {
        // On successful checkout session creation, redirect to Stripe Checkout.
        window.location.href = data.sessionUrl
      }
    } catch (err: any) {
      setBookingMessage(err.message)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 text-red-500 text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 text-center">
            <p className="text-xl">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const amenities = [
    { icon: <Wifi className="h-5 w-5" />, name: "Free WiFi" },
    { icon: <Coffee className="h-5 w-5" />, name: "Coffee Maker" },
    { icon: <Home className="h-5 w-5" />, name: "Spacious Living Area" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex text-sm text-gray-500">
              <li className="mr-2">
                <a href="/" className="hover:text-teal-600">
                  Home
                </a>
              </li>
              <li className="mr-2">/</li>
              <li className="mr-2">
                <a href="/products" className="hover:text-teal-600">
                  Rentals
                </a>
              </li>
              <li className="mr-2">/</li>
              <li className="font-medium text-gray-900 truncate max-w-xs">{product.title}</li>
            </ol>
          </nav>

          {/* Product Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-500">Popular location</span>
              <Badge variant="outline" className="ml-3 bg-teal-50 text-teal-700 border-teal-200">
                Top Rated
              </Badge>
            </div>
          </div>

          {/* Product Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-gray-100 h-80">
                <img
                  src={activeImage || product.images?.[0] || "/placeholder.svg?height=600&width=800"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.images &&
                  product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer rounded-lg overflow-hidden h-20 ${activeImage === img ? "ring-2 ring-teal-500" : ""}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.title} - view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-3xl font-bold text-teal-700">
                    ${product.price}
                    <span className="text-lg font-normal text-gray-500">/night</span>
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-gray-500 text-sm">(28 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn" className="block mb-1 font-medium">
                      Check-In Date
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={checkIn}
                        onChange={(date: Date) => setCheckIn(date)}
                        filterDate={filterAvailableDate}
                        placeholderText="Select check-in date"
                        className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="checkOut" className="block mb-1 font-medium">
                      Check-Out Date
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={checkOut}
                        onChange={(date: Date) => setCheckOut(date)}
                        filterDate={filterAvailableDate}
                        placeholderText="Select check-out date"
                        className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="guestName" className="block mb-1 font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="guestName"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="guestEmail" className="block mb-1 font-medium">
                    Your Email
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {checkIn && checkOut && (
                  <div className="border-t border-b py-4 my-4">
                    <div className="flex justify-between mb-2">
                      <span>
                        ${product.price} x{" "}
                        {Math.ceil(Math.abs((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))} nights
                      </span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Cleaning fee</span>
                      <span>$35</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Service fee</span>
                      <span>$25</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotalPrice() + 60}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6">
                  Book Now
                </Button>

                {bookingMessage && (
                  <div
                    className={`p-3 rounded-md text-center ${bookingMessage.includes("not available") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                  >
                    {bookingMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {product.description ||
                    `Experience luxury and comfort in this stunning vacation rental. Perfect for weekend getaways, this property offers all the amenities you need for a relaxing stay. Located in a prime location with easy access to local attractions, restaurants, and activities.
                    
                    The space features modern furnishings, high-end appliances, and thoughtful touches to make your stay memorable. Enjoy the peaceful surroundings and beautiful views while being just minutes away from everything you might need.`}
                </p>

                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="mr-2 text-teal-600">{amenity.icon}</div>
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mb-3">House rules</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                    <span>Check-in: After 3:00 PM</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                    <span>Checkout: 11:00 AM</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                    <span>No smoking</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                    <span>No pets</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-xl font-semibold mb-4">Available Dates</h3>
                <div className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from(availableDatesSet)
                      .slice(0, 10)
                      .map((dateStr, idx) => (
                        <div key={idx} className="px-3 py-2 bg-teal-50 text-teal-700 rounded-md text-sm">
                          {new Date(dateStr).toLocaleDateString()}
                        </div>
                      ))}
                    {availableDatesSet.size > 10 && (
                      <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm text-center">
                        +{availableDatesSet.size - 10} more dates
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
