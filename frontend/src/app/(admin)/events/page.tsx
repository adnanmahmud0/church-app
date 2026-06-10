"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Users, Clock, History, MoreHorizontal, Pencil, Trash, Tags, SmartphoneIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EventsMobilePreview } from "@/components/events-mobile-preview"

export default function EventsDashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

  // Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3b5bdb")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [eventsRes, statsRes, catRes] = await Promise.all([
        apiFetch(`/events/admin?status=${activeTab}`),
        apiFetch(`/events/stats`),
        apiFetch(`/events/categories`)
      ])
      
      if (eventsRes?.success) {
        setEvents(eventsRes.data.events || [])
      }
      
      if (statsRes?.success) {
        setStats(statsRes.data)
      }

      if (catRes?.success) {
        setCategories(catRes.data.filter((c: any) => c.id !== 'all'))
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This will also remove all RSVPs.")) return
    
    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' })
      toast.success("Event deleted")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event")
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategoryColor) return
    try {
      await apiFetch(`/events/categories`, {
        method: 'POST',
        body: JSON.stringify({ label: newCategoryName, color: newCategoryColor })
      })
      toast.success("Category created")
      setNewCategoryName("")
      setNewCategoryColor("#3b5bdb")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to create category")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await apiFetch(`/events/categories/${id}`, { method: 'DELETE' })
      toast.success("Category deleted")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Events Dashboard</h2>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full shrink-0">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tags className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Event Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Category Name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Input 
                    type="color" 
                    className="w-16 p-1 cursor-pointer h-10"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                  <Button onClick={handleCreateCategory}>Add</Button>
                </div>
                <div className="rounded-md border divide-y">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <div className="size-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-sm">{cat.label}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash className="size-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-4 text-center text-sm text-zinc-500">No categories found.</div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/events/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUpcoming || 0}</div>
            <p className="text-xs text-muted-foreground">Total upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Events in the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRsvps || 0}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">RSVPs per event</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Events</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'upcoming' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </Button>
              <Button 
                variant={activeTab === 'past' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('past')}
              >
                Past
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">RSVPs</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                          No {activeTab} events found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {event.title}
                            {event.isDraft && (
                              <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="size-2.5 rounded-full" style={{ backgroundColor: event.categoryColor }} />
                              <span className="text-sm text-zinc-600">{event.categoryLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{event.date}</div>
                            <div className="text-xs text-zinc-500">{event.time}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm truncate max-w-[150px]">{event.location}</div>
                          </TableCell>
                          <TableCell>
                            {event.isPast ? (
                              <Badge variant="secondary">Completed</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Upcoming</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {event.attendingCount}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href={`/events/${event.id}/edit`}>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Event
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDelete(event.id)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <EventsMobilePreview events={events} categories={categories} stats={stats} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
