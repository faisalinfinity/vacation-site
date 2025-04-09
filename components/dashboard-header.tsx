"use client"

import { useState, useEffect } from "react"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DashboardSidebar from "./dashboard-sidebar"

interface DashboardHeaderProps {
  title: string
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const [userName, setUserName] = useState("Provider")

  useEffect(() => {
    // You could fetch the user's name from an API here
    // For now, we'll just use a placeholder
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.name) {
          setUserName(userData.name)
        }
      } catch (e) {
        console.error("Error parsing user data", e)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <div className="text-sm font-medium">{userName}</div>
            <div className="text-xs text-gray-500">Property Provider</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  )
}
