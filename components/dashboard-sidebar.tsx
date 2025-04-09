"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, LayoutDashboard, LogOut, MessageSquare, PlusCircle, Settings, User } from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/auth/login"
    }
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Add Property",
      href: "/dashboard/products/new",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="h-full bg-white border-r flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-teal-600" />
          <span className="text-xl font-bold text-teal-600">StayAway</span>
        </Link>
      </div>

      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(item.href) ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
