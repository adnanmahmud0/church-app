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
import { LayoutDashboardIcon, Settings2Icon, CommandIcon, ImageIcon } from "lucide-react"
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
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Admin Management",
      url: "/admin",
      icon: (
        <CommandIcon />
      ),
      roles: ["SUPER_ADMIN"],
    },
    {
      title: "Media",
      url: "/media",
      icon: (
        <ImageIcon />
      ),
    },
    {
      title: "Sermons",
      url: "/sermons",
      icon: (
        <CommandIcon /> // You can use a better icon if you want, like MicIcon or HeadphonesIcon
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
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
