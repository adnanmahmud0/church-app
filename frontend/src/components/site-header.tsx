"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/lib/api"

export function SiteHeader() {
  const [time, setTime] = useState<Date | null>(null)
  const offsetRef = useRef<number>(0)

  useEffect(() => {
    // Initial fetch to get server time
    const fetchServerTime = async () => {
      try {
        const res = await apiFetch('/admin/server-time')
        if (res.success && res.data?.time) {
          const serverTime = new Date(res.data.time).getTime()
          offsetRef.current = serverTime - Date.now()
        }
      } catch (err) {
        console.error('Failed to fetch server time')
      }
      setTime(new Date(Date.now() + offsetRef.current))
    }

    fetchServerTime()

    const interval = setInterval(() => {
      setTime(new Date(Date.now() + offsetRef.current))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

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
        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {time ? time.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }) : ''}
        </div>
      </div>
    </header>
  )
}
