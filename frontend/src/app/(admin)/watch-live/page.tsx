"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SmartphoneIcon } from "lucide-react"
import { WatchLiveMobilePreview } from "@/components/watch-live-mobile-preview"
import { SettingsCard } from "./components/SettingsCard"
import { LiveStatusMonitor } from "./components/LiveStatusMonitor"
import { RecentVideosTable } from "./components/RecentVideosTable"
import { OtherPlatformsTable } from "./components/OtherPlatformsTable"

export default function WatchLivePage() {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Watch Live</h2>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full shrink-0">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <SettingsCard />
          <OtherPlatformsTable />
        </div>
        
        <div className="col-span-3 space-y-4">
          <LiveStatusMonitor />
          <RecentVideosTable />
        </div>
      </div>

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <WatchLiveMobilePreview />
        </DialogContent>
      </Dialog>
    </div>
  )
}
