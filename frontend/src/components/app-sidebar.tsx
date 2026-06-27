"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Shield, 
  Film, 
  Mic, 
  Gift, 
  HandHeart, 
  Users, 
  CalendarDays, 
  BookOpen, 
  Book, 
  Tv, 
  Landmark,
  Settings2,
  User,
  Bell,
  Clock,
  Phone,
  FileText
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    role: "SUPER_ADMIN",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard />,
    },
    {
      title: "Admin Management",
      url: "/admin",
      icon: <Shield />,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "Media",
      url: "/media",
      icon: <Film />,
    },
    {
      title: "User",
      url: "/users",
      icon: <User />,
    },
    {
      title: "Sermons",
      url: "/sermons",
      icon: <Mic />,
    },
    {
      title: "Gives",
      url: "/giving",
      icon: <Gift />,
    },
    {
      title: "Prayer",
      url: "/prayer",
      icon: <HandHeart />,
    },
    {
      title: "Community",
      url: "/community",
      icon: <Users />,
    },
    {
      title: "Event",
      url: "/events",
      icon: <CalendarDays />,
    },
    {
      title: "Devotionals",
      url: "/devotionals",
      icon: <BookOpen />,
    },
    {
      title: "Bible",
      url: "/bible",
      icon: <Book />,
    },
    {
      title: "Watch Live",
      url: "/watch-live",
      icon: <Tv />,
    },
    {
      title: "History and core Values",
      url: "/history",
      icon: <Landmark />,
    },
    {
      title: "Contact & Mission",
      url: "/contact-mission",
      icon: <Phone />,
    },
    {
      title: "Legal",
      url: "/legal",
      icon: <FileText />,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: <Bell />,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "Sunday Service Time",
      url: "/sunday-service",
      icon: <Clock />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2 />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  // Use the authenticated user, fallback to mocked data if null (for design purposes)
  const activeUser = user || data.user

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <img src="/logo.png" alt="Church App Logo" className="size-5 object-contain" />
                <span className="text-base font-semibold">Church App</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain.filter(item => !item.roles || (activeUser.role && item.roles.includes(activeUser.role.toUpperCase())))} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={activeUser as any} />
      </SidebarFooter>
    </Sidebar>
  )
}
