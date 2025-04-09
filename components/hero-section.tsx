import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="relative">
      {/* Hero image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1600')",
            backgroundPosition: "center 30%",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-32 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          <span className="block">Find Your Perfect</span>
          <span className="block text-teal-400">Getaway Destination</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-white">
          Discover amazing vacation rentals for your next adventure. Book unique homes and experiences all around the
          world.
        </p>

        {/* Search form */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Where are you going?"
                />
              </div>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Check-in"
                />
              </div>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Check-out"
                />
              </div>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border">
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Search Getaways</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
