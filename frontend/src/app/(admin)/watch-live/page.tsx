"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsCard } from "./components/SettingsCard"
import { LiveStatusMonitor } from "./components/LiveStatusMonitor"
import { RecentVideosTable } from "./components/RecentVideosTable"
import { OtherPlatformsTable } from "./components/OtherPlatformsTable"

export default function WatchLivePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Watch Live</h2>
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
    </div>
  )
}
