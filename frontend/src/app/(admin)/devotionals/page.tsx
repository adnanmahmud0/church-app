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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DevotionalsMobilePreview } from "@/components/devotionals-mobile-preview"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { BookIcon, PencilIcon, TrashIcon, PlusIcon, UsersIcon, BarChart3Icon, CalendarIcon, SmartphoneIcon, SettingsIcon } from "lucide-react"

export default function DevotionalsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [devotionals, setDevotionals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [appearanceTime, setAppearanceTime] = useState("00:00")
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, devRes, infoRes] = await Promise.all([
        apiFetch("/devotionals/admin/stats"),
        apiFetch("/devotionals?limit=100"), // get recent for table
        apiFetch("/church-info/admin")
      ])
      
      if (statsRes.success) setStats(statsRes.data)
      if (devRes.success) setDevotionals(devRes.data.devotionals)
      if (infoRes.success) setAppearanceTime(infoRes.data.devotional_appearance_time || "00:00")
    } catch (error) {
      toast.error("Failed to load devotionals data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this devotional?")) return
    try {
      await apiFetch(`/devotionals/${id}`, { method: "DELETE" })
      toast.success("Devotional deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete devotional")
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true)
      const res = await apiFetch("/church-info/admin", {
        method: "PUT",
        body: JSON.stringify({ devotional_appearance_time: appearanceTime })
      })
      if (res.success) {
        toast.success("Settings saved successfully")
        setIsSettingsOpen(false)
      } else {
        toast.error(res.message || "Failed to save settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving settings")
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Devotionals</h2>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} title="Devotionals Settings" className="rounded-full shrink-0">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full shrink-0">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devotionals</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDevotionals || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalReads || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Readers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.uniqueReaders || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Ahead</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.upcomingScheduled || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* DEVOTIONALS TABLE */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Devotionals List</CardTitle>
              <CardDescription>Manage and publish your daily devotionals.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/devotionals/new">
                <PlusIcon className="mr-2 h-4 w-4" /> Create Devotional
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Scripture</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devotionals.map((dev: any) => (
                  <TableRow key={dev.id}>
                    <TableCell className="font-medium">{dev.date}</TableCell>
                    <TableCell>
                      {dev.posted ? (
                        <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-500">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{dev.title}</TableCell>
                    <TableCell className="text-muted-foreground">{dev.scriptureRef}</TableCell>
                    <TableCell>
                      <Badge variant={dev.isDraft ? "secondary" : "default"} className={!dev.isDraft ? "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-800" : ""}>
                        {dev.isDraft ? "Draft" : "Published"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/devotionals/${dev.id}/edit`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(dev.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {devotionals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No devotionals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ANALYTICS PANEL */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Devotionals</CardTitle>
            <CardDescription>
              Most read devotionals of all time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.topDevotionals?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center font-bold">
                    {item.readCount}
                  </div>
                </div>
              ))}
              
              {!stats?.topDevotionals?.length && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Not enough data yet.
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-bold mb-4">Reads (Last 14 Days)</h4>
              <div className="h-48 flex items-end justify-between gap-1">
                {stats?.chartData?.map((item: any, i: number) => {
                  const maxReads = Math.max(...(stats.chartData.map((d: any) => d.reads) || [1]));
                  const height = maxReads > 0 ? (item.reads / maxReads) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 group relative flex-1">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                        {item.reads} reads<br/>{item.date}
                      </div>
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm min-h-[4px] hover:bg-blue-600 transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      ></div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{stats?.chartData?.[0]?.date.slice(5)}</span>
                <span>{stats?.chartData?.[13]?.date.slice(5)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <DevotionalsMobilePreview devotionals={devotionals} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogTitle>Devotionals Settings</DialogTitle>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Appearance Time</label>
              <p className="text-xs text-muted-foreground">Select what time of day the new devotional should appear on the app (uses the Church Timezone).</p>
              <input 
                type="time" 
                value={appearanceTime}
                onChange={(e) => setAppearanceTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
