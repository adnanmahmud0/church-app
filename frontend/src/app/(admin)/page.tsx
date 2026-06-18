"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import {
  UsersIcon,
  MicIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  HandHeartIcon,
  Users2Icon,
  GiftIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "lucide-react"

interface DashboardData {
  users: { total: number; newThisMonth: number }
  sermons: { total: number }
  events: { total: number; upcoming: number; totalRsvps: number }
  devotionals: { total: number; totalReads: number }
  prayer: { totalRequests: number; activeRequests: number; totalPrays: number }
  community: { totalGroups: number; activeGroups: number }
  giving: { totalThisYear: number; totalThisMonth: number }
  registrationChart: { date: string; count: number }[]
  recentUsers: { id: string; name: string; email: string; image: string; joinedAt: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const res = await apiFetch("/admin/dashboard")
      if (res.success) setData(res.data)
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: data.users.total,
      subtitle: `+${data.users.newThisMonth} this month`,
      icon: UsersIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/users",
    },
    {
      title: "Sermons",
      value: data.sermons.total,
      subtitle: "Total published",
      icon: MicIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/sermons",
    },
    {
      title: "Events",
      value: data.events.total,
      subtitle: `${data.events.upcoming} upcoming`,
      icon: CalendarDaysIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/events",
    },
    {
      title: "Devotionals",
      value: data.devotionals.total,
      subtitle: `${data.devotionals.totalReads} total reads`,
      icon: BookOpenIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/devotionals",
    },
    {
      title: "Prayer Requests",
      value: data.prayer.activeRequests,
      subtitle: `${data.prayer.totalPrays} total prays`,
      icon: HandHeartIcon,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/prayer",
    },
    {
      title: "Community Groups",
      value: data.community.activeGroups,
      subtitle: `${data.community.totalGroups} total groups`,
      icon: Users2Icon,
      color: "text-teal-600",
      bg: "bg-teal-50",
      href: "/community",
    },
    {
      title: "Giving This Month",
      value: `£${data.giving.totalThisMonth.toFixed(2)}`,
      subtitle: `£${data.giving.totalThisYear.toFixed(2)} this year`,
      icon: GiftIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/giving",
    },
    {
      title: "Event RSVPs",
      value: data.events.totalRsvps,
      subtitle: "Total RSVPs received",
      icon: TrendingUpIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/events",
    },
  ]

  const maxChartVal = Math.max(...data.registrationChart.map(d => d.count), 1)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your church app activity.</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* REGISTRATION CHART */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>New app users over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-end justify-between gap-[2px]">
              {data.registrationChart.map((item, i) => {
                const height = maxChartVal > 0 ? (item.count / maxChartVal) * 100 : 0
                return (
                  <div key={i} className="flex flex-col items-center gap-1 group relative flex-1">
                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                      {item.count} user{item.count !== 1 ? "s" : ""}<br />{item.date}
                    </div>
                    <div
                      className="w-full bg-blue-500 rounded-t-sm min-h-[4px] hover:bg-blue-600 transition-colors"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{data.registrationChart[0]?.date.slice(5)}</span>
              <span>{data.registrationChart[data.registrationChart.length - 1]?.date.slice(5)}</span>
            </div>
          </CardContent>
        </Card>

        {/* RECENT USERS */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newest app members.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/users">
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
              ))}
              {data.recentUsers.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No users yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK LINKS */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to frequently used pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/sermons/new">
                <MicIcon className="h-4 w-4 text-purple-500" /> New Sermon
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/events/new">
                <CalendarDaysIcon className="h-4 w-4 text-orange-500" /> New Event
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/devotionals/new">
                <BookOpenIcon className="h-4 w-4 text-emerald-500" /> New Devotional
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/prayer">
                <HandHeartIcon className="h-4 w-4 text-rose-500" /> View Prayers
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
