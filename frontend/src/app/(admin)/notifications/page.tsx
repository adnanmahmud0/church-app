"use client"

import * as React from "react"
import { useState } from "react"
import { Send, Loader2, Bell } from "lucide-react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NotificationsDashboard() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [topic, setTopic] = useState("custom")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required")
      return
    }

    setIsSending(true)
    try {
      const response = await apiFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify({ title, body, topic, data: { type: topic } }),
      })

      if (response?.success) {
        toast.success("Notification sent successfully!")
        setTitle("")
        setBody("")
      } else {
        toast.error("Failed to send notification")
      }
    } catch (error: any) {
      console.error("Send notification error:", error)
      toast.error(error.message || "An error occurred while sending the notification")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Push Notifications</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send a Notification</CardTitle>
            <CardDescription>
              Broadcast a push notification to all registered users on the mobile app.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSend}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Sunday Service Reminder" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message Body</Label>
                <Textarea 
                  id="body" 
                  placeholder="e.g., Join us this Sunday at 10 AM..." 
                  className="min-h-[120px]"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Notification Topic (Type)</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">General / Custom (All Users)</SelectItem>
                    <SelectItem value="sermon">Sermons (Opt-in users)</SelectItem>
                    <SelectItem value="service_reminder">Service Reminders (Opt-in users)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-muted-foreground" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 mt-2 max-w-[320px] mx-auto overflow-hidden bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="size-4 bg-primary rounded-sm flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground font-bold">C</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Church App</span>
                </div>
                <span className="text-xs text-muted-foreground">now</span>
              </div>
              <p className="font-semibold text-sm line-clamp-1 mb-1">
                {title || "Notification Title"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {body || "Your message will appear here..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
