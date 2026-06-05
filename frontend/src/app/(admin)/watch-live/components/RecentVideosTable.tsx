"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw } from "lucide-react"

export function RecentVideosTable() {
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch("/watch-live/youtube/recent?limit=10")
      if (res?.success) {
        setVideos(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch recent videos", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Services</CardTitle>
          <CardDescription>Last 10 videos fetched from YouTube channel.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVideos} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && videos.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground border rounded-md border-dashed">
            No recent videos found.
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.videoId} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className="w-24 h-16 object-cover rounded bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{video.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{video.publishedFormatted}</span>
                    <span>•</span>
                    <span>{video.duration}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <a href={video.watchUrl} target="_blank" rel="noreferrer" title="Watch on YouTube">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
