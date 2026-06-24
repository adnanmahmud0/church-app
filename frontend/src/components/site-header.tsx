"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland"
];

export function SiteHeader() {
  const [time, setTime] = useState<Date | null>(null)
  const [timezone, setTimezone] = useState<string>("UTC")
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTz, setSelectedTz] = useState("UTC")
  const offsetRef = useRef<number>(0)

  const fetchServerTime = async () => {
    try {
      const res = await apiFetch('/admin/server-time')
      if (res.success && res.data?.time) {
        const serverTime = new Date(res.data.time).getTime()
        offsetRef.current = serverTime - Date.now()
        if (res.data.timezone) {
          setTimezone(res.data.timezone)
          setSelectedTz(res.data.timezone)
        }
      }
    } catch (err) {
      console.error('Failed to fetch server time')
    }
    setTime(new Date(Date.now() + offsetRef.current))
  }

  useEffect(() => {
    fetchServerTime()

    const interval = setInterval(() => {
      setTime(new Date(Date.now() + offsetRef.current))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSaveTimezone = async () => {
    try {
      setIsSaving(true)
      const res = await apiFetch("/church-info/admin", {
        method: "PUT",
        body: JSON.stringify({ timezone: selectedTz })
      });
      if (res.success) {
        toast.success("Timezone updated successfully")
        setTimezone(selectedTz)
        setIsOpen(false)
        fetchServerTime()
      } else {
        throw new Error(res.message || "Failed to update timezone")
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {time ? time.toLocaleString('en-US', {
              timeZone: timezone,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            }) : ''}
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
                <Settings className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Server Timezone</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Location / Timezone
                  </label>
                  <select
                    value={selectedTz}
                    onChange={(e) => setSelectedTz(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  >
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">
                    This timezone will be used for displaying the dashboard time and triggering scheduled push notifications (like Sunday Service reminders).
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveTimezone}
                  disabled={isSaving}
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Timezone"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
