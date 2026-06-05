"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Calendar, Radio } from "lucide-react"

export function LiveStatusMonitor() {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const res = await apiFetch("/watch-live/youtube/status")
      if (res?.success) {
        setStatus(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch live status", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Status Monitor</CardTitle>
          <CardDescription>Auto-refreshes every 60 seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Checking status...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Status Monitor</CardTitle>
        <CardDescription>Auto-refreshes every 60 seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        {status?.isLive && status.liveStream ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
            <Badge variant="destructive" className="mb-4 text-sm px-3 py-1 animate-pulse">
              <Radio className="w-4 h-4 mr-2" /> LIVE NOW
            </Badge>
            <h4 className="text-xl font-bold text-center mb-2">{status.liveStream.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{status.liveStream.channelTitle}</p>
            <a 
              href={status.liveStream.watchUrl} 
              target="_blank" 
              rel="noreferrer"
              className="relative group w-full max-w-sm rounded-lg overflow-hidden border"
            >
              <img 
                src={status.liveStream.thumbnailUrl} 
                alt="Live Stream Thumbnail" 
                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-red-600 text-white px-4 py-2 rounded-full font-medium">Watch on YouTube</span>
              </div>
            </a>
          </div>
        ) : status?.upcomingStream ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
            <Badge variant="outline" className="mb-4 text-sm px-3 py-1 border-amber-500 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4 mr-2" /> Scheduled
            </Badge>
            <h4 className="text-xl font-bold text-center mb-2">{status.upcomingStream.title}</h4>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">{status.upcomingStream.scheduledAtFormatted}</p>
            <a 
              href={status.upcomingStream.watchUrl} 
              target="_blank" 
              rel="noreferrer"
              className="relative group w-full max-w-sm rounded-lg overflow-hidden border"
            >
              <img 
                src={status.upcomingStream.thumbnailUrl} 
                alt="Upcoming Stream Thumbnail" 
                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
              />
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/30">
            <Badge variant="secondary" className="mb-2">Offline</Badge>
            <p className="text-muted-foreground text-sm">No active or scheduled stream found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
