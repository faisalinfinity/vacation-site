import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function FeaturedSection() {
  const featuredDestinations = [
    {
      id: 1,
      name: "Beach Paradise",
      image: "/placeholder.svg?height=400&width=600",
      properties: 42,
    },
    {
      id: 2,
      name: "Mountain Retreat",
      image: "/placeholder.svg?height=400&width=600",
      properties: 28,
    },
    {
      id: 3,
      name: "City Escape",
      image: "/placeholder.svg?height=400&width=600",
      properties: 56,
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Destinations</h2>
          <Link href="/destinations" className="text-teal-600 hover:text-teal-800 flex items-center">
            View all destinations
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDestinations.map((destination) => (
            <Link key={destination.id} href={`/destinations/${destination.id}`} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-md h-64">
                <img
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-semibold">{destination.name}</h3>
                  <p className="text-sm">{destination.properties} properties</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
