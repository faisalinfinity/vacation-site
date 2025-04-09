import type { ReactNode } from "react"
import DashboardSidebar from "./dashboard-sidebar"
import DashboardHeader from "./dashboard-header"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block md:w-64 shrink-0">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <DashboardHeader title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
