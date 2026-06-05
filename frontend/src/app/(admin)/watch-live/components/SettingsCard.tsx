"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"

export function SettingsCard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showKey, setShowKey] = useState(false)
  
  const [testResult, setTestResult] = useState<{valid: boolean, message?: string} | null>(null)

  const [settings, setSettings] = useState({
    youtubeApiKey: "",
    youtubeChannelId: "",
    serviceSchedule: "",
    serviceTime: "",
    serviceAddress: ""
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await apiFetch("/watch-live/settings")
      if (res?.success) {
        setSettings(res.data)
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await apiFetch("/watch-live/settings", {
        method: "PATCH",
        body: JSON.stringify(settings)
      })
      if (res?.success) {
        toast.success("Settings saved successfully")
        setTestResult(null) // reset test result after save
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!settings.youtubeChannelId) {
      toast.error("Please enter a YouTube Channel ID")
      return
    }

    setIsTesting(true)
    try {
      const res = await apiFetch("/watch-live/settings/test-youtube", {
        method: "POST",
        body: JSON.stringify({
          youtubeApiKey: settings.youtubeApiKey,
          youtubeChannelId: settings.youtubeChannelId
        })
      })

      if (res?.success && res.data.valid) {
        setTestResult({ valid: true, message: `Connected — ${res.data.channelTitle}` })
        toast.success("YouTube connection successful!")
      } else {
        setTestResult({ valid: false, message: res?.message || "Connection failed" })
        toast.error("Failed to connect to YouTube")
      }
    } catch (error: any) {
      setTestResult({ valid: false, message: error.message || "An error occurred" })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) return <div>Loading settings...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Configuration</CardTitle>
        <CardDescription>Configure YouTube integration and static service information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* YouTube Config */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">YouTube Integration</h3>
          
          <div className="space-y-2">
            <Label htmlFor="youtubeApiKey">YouTube API Key</Label>
            <div className="relative">
              <Input
                id="youtubeApiKey"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={settings.youtubeApiKey}
                onChange={(e) => setSettings({ ...settings, youtubeApiKey: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Required to fetch live status and recent videos. Masked for security.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeChannelId">YouTube Channel ID</Label>
            <Input
              id="youtubeChannelId"
              placeholder="UC..."
              value={settings.youtubeChannelId}
              onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })}
            />
            <a href="https://support.google.com/youtube/answer/3250431" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
              How to find your Channel ID
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            {settings.youtubeChannelId && (
              <Button variant="outline" asChild>
                <a href={`https://www.youtube.com/channel/${settings.youtubeChannelId}`} target="_blank" rel="noreferrer">
                  View Channel
                </a>
              </Button>
            )}
            
            {testResult && (
              <div className={`flex items-center text-sm ${testResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.valid ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        <hr />

        {/* Service Info Config */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Service Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="serviceSchedule">Schedule (e.g. Every Sunday)</Label>
            <Input
              id="serviceSchedule"
              value={settings.serviceSchedule}
              onChange={(e) => setSettings({ ...settings, serviceSchedule: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceTime">Time (e.g. 10:00 AM – 12:30 PM)</Label>
            <Input
              id="serviceTime"
              value={settings.serviceTime}
              onChange={(e) => setSettings({ ...settings, serviceTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAddress">Address</Label>
            <Input
              id="serviceAddress"
              value={settings.serviceAddress}
              onChange={(e) => setSettings({ ...settings, serviceAddress: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
