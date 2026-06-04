"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { CopyIcon, RefreshCw, Trash2, BookIcon } from "lucide-react"

export default function BibleAdminPage() {
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [healthRes, settingsRes, cacheRes] = await Promise.all([
        fetch(`${apiUrl}/bible/health`).then(res => res.json()).catch(() => ({ success: false })),
        fetch(`${apiUrl}/bible/settings`).then(res => res.json()).catch(() => ({ success: false })),
        fetch(`${apiUrl}/bible/cache-stats`).then(res => res.json()).catch(() => ({ success: false }))
      ])

      if (healthRes.success) setHealth(healthRes.data)
      if (settingsRes.success) setSettings(settingsRes.data)
      if (cacheRes.success) setCacheStats(cacheRes.data)
    } catch (error) {
      toast.error('Failed to load Bible module data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      const res = await fetch(`${apiUrl}/bible/health`).then(r => r.json())
      if (res.success) {
        setHealth(res.data)
        toast.success('Connection to YouVersion API successful')
      } else {
        toast.error('Connection failed: ' + res.message)
      }
    } catch (err) {
      toast.error('Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the Bible cache?')) return;
    
    setClearingCache(true)
    try {
      const res = await fetch(`${apiUrl}/bible/clear-cache`, { method: 'POST' }).then(r => r.json())
      if (res.success) {
        toast.success('Cache cleared successfully')
        fetchDashboardData()
      } else {
        toast.error('Failed to clear cache')
      }
    } catch (err) {
      toast.error('Failed to clear cache')
    } finally {
      setClearingCache(false)
    }
  }

  const handleVersionToggle = async (id: number, isActive: boolean) => {
    if (!settings) return;
    const newVersions = settings.versions.map((v: any) => v.id === id ? { ...v, isActive } : v)
    
    try {
      const res = await fetch(`${apiUrl}/bible/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versions: newVersions })
      }).then(r => r.json())

      if (res.success) {
        setSettings(res.data)
        toast.success('Version status updated')
      }
    } catch (err) {
      toast.error('Failed to update version status')
    }
  }

  const handleDefaultVersionChange = async (versionId: string) => {
    try {
      const res = await fetch(`${apiUrl}/bible/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultVersionId: parseInt(versionId) })
      }).then(r => r.json())

      if (res.success) {
        setSettings(res.data)
        toast.success('Default version updated')
      }
    } catch (err) {
      toast.error('Failed to update default version')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) return <div className="p-8">Loading Bible Module...</div>

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bible Module</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Section 1: API Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Connection Status</CardTitle>
            <CardDescription>YouVersion Platform API details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Status:</span>
              {health?.status === 'Connected' ? (
                <Badge className="bg-green-500">Connected</Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </div>
            <div className="text-sm">
              <span className="font-semibold">App Key:</span> Gg***Gy1R
            </div>
            <div className="text-sm">
              <span className="font-semibold">App Created:</span> 4 Jun 2026, 12:40
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleTestConnection} disabled={testingConnection}>
              <RefreshCw className={`mr-2 h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </CardFooter>
        </Card>

        {/* Section 4: Cache Management */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
            <CardDescription>Manage in-memory API cache</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <span className="font-semibold">Books Cached:</span> {cacheStats?.books || 0}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Chapters Cached:</span> {cacheStats?.chapters || 0}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Verses Cached:</span> {cacheStats?.verses || 0}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Total Keys:</span> {cacheStats?.total || 0}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleClearCache} disabled={clearingCache}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Bible Cache
            </Button>
          </CardFooter>
        </Card>

        {/* Section 5: API Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Stats</CardTitle>
            <CardDescription>Bible reading analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <span className="font-semibold">Requests Today:</span> 1,245
            </div>
            <div className="text-sm">
              <span className="font-semibold">Most Read Book:</span> Psalms
            </div>
            <div className="text-sm">
              <span className="font-semibold">Most Used Version:</span> KJV
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Section 2: Supported Versions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Supported Bible Versions</CardTitle>
            <CardDescription>Manage available translations for the mobile app</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbr</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings?.versions?.map((version: any) => (
                  <TableRow key={version.id}>
                    <TableCell className="font-medium">{version.name}</TableCell>
                    <TableCell>{version.abbreviation}</TableCell>
                    <TableCell>{version.id}</TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={version.isActive} 
                        onCheckedChange={(checked) => handleVersionToggle(version.id, !!checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>+ Add Version (Coming Soon)</Button>
          </CardFooter>
        </Card>

        {/* Section 3 & 6: App Default & Dev Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Version Setting</CardTitle>
              <CardDescription>The translation shown first to users</CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <Select value={settings.defaultVersionId.toString()} onValueChange={handleDefaultVersionChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.versions.filter((v: any) => v.isActive).map((version: any) => (
                      <SelectItem key={version.id} value={version.id.toString()}>
                        {version.abbreviation} - {version.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>App Developer Info</CardTitle>
              <CardDescription>API endpoints for the mobile app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm p-3 bg-muted rounded-md flex justify-between items-center">
                <span className="truncate mr-2 font-mono">{apiUrl}/bible/versions</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${apiUrl}/bible/versions`)}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm p-3 bg-muted rounded-md flex justify-between items-center">
                <span className="truncate mr-2 font-mono">{apiUrl}/bible/books?version=1</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${apiUrl}/bible/books?version=1`)}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm p-3 bg-muted rounded-md flex justify-between items-center">
                <span className="truncate mr-2 font-mono">{apiUrl}/bible/books/GEN/chapters?version=1</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${apiUrl}/bible/books/GEN/chapters?version=1`)}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm p-3 bg-muted rounded-md flex justify-between items-center">
                <span className="truncate mr-2 font-mono">{apiUrl}/bible/books/GEN/chapters/1?version=1</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${apiUrl}/bible/books/GEN/chapters/1?version=1`)}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
