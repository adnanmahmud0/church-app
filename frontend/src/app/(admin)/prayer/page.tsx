"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { RefreshCw, Trash2, HeartIcon, ArchiveIcon, CheckCircleIcon, SmartphoneIcon } from "lucide-react"
import { PrayerMobilePreview } from "@/components/prayer-mobile-preview"
import { apiFetch } from "@/lib/api"

export default function PrayerAdminPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, requestsRes] = await Promise.all([
        apiFetch('/prayer/requests/stats').catch(() => ({ success: false })),
        apiFetch('/prayer/requests?limit=50').catch(() => ({ success: false }))
      ])

      if (statsRes && statsRes.success) setStats(statsRes.data)
      if (requestsRes && requestsRes.success) {
        setRequests(requestsRes.data)
        setPagination(requestsRes.pagination)
      }
    } catch (error) {
      toast.error('Failed to load Prayer Module data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/prayer/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })

      if (res.success) {
        toast.success(`Prayer request marked as ${newStatus}`)
        fetchDashboardData()
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete/archive this prayer request?')) return;
    
    try {
      const res = await apiFetch(`/prayer/requests/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Prayer request archived successfully')
        fetchDashboardData()
      } else {
        toast.error('Failed to archive request')
      }
    } catch (err) {
      toast.error('Failed to archive request')
    }
  }

  if (loading && !stats) return <div className="p-8 flex items-center gap-2"><RefreshCw className="animate-spin h-5 w-5" /> Loading Prayer Module...</div>

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Prayer Module</h2>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Stats Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">All time prayer requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prays (Interactions)</CardTitle>
            <HeartIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPrays || 0}</div>
            <p className="text-xs text-muted-foreground">Number of times people prayed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Prayer Requests</CardTitle>
            <CardDescription>Manage active prayer requests submitted by users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Prays</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No active prayer requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests?.map((req: any) => (
                    <TableRow key={req._id}>
                      <TableCell className="whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        {req.is_anonymous ? 'Anonymous' : req.author_name || 'Anonymous'}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={req.content}>
                        {req.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          <HeartIcon className="h-3 w-3" /> {req.pray_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={req.status} 
                          onValueChange={(val) => handleUpdateStatus(req._id, val)}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(req._id)} className="text-destructive">
                          <ArchiveIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <PrayerMobilePreview requests={requests} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
