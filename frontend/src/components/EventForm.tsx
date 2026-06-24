"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { CalendarIcon, Clock, MapPinIcon, Loader2 } from "lucide-react"

export default function EventForm({ initialData = null, categories = [] }: { initialData?: any, categories?: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Preview States
  const [previewTitle, setPreviewTitle] = useState("")
  const [previewCategoryId, setPreviewCategoryId] = useState("")
  const [previewDate, setPreviewDate] = useState("")
  const [previewTime, setPreviewTime] = useState("")
  const [previewLocation, setPreviewLocation] = useState("")
  const [previewDescription, setPreviewDescription] = useState("")
  
  const selectedCategory = categories.find(c => c.id === previewCategoryId || c._id === previewCategoryId)

  useEffect(() => {
    if(initialData) {
      setPreviewTitle(initialData.title || "")
      setPreviewCategoryId(initialData.categoryId?._id || initialData.categoryId || "")
      setPreviewDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : "")
      setPreviewTime(initialData.time || "")
      setPreviewLocation(initialData.location || "")
      setPreviewDescription(initialData.description || "")
    } else {
      setPreviewTitle("")
      setPreviewCategoryId("")
      setPreviewDate("")
      setPreviewTime("")
      setPreviewLocation("")
      setPreviewDescription("")
    }
  }, [initialData])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (!previewCategoryId) {
      toast.error("Please select a category")
      return
    }

    const payload = {
      title: formData.get("title") as string,
      categoryId: previewCategoryId,
      date: new Date(formData.get("date") as string).toISOString(),
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      isDraft: formData.get("isDraft") === "on",
    }

    setIsLoading(true)
    try {
      const endpoint = initialData 
        ? `/events/${initialData._id || initialData.id}` 
        : `/events`
      
      const method = initialData ? 'PUT' : 'POST'

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      })
      
      toast.success(initialData ? "Event updated successfully" : "Event created successfully")
      router.push("/events")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 bg-white border rounded-xl overflow-hidden shadow-sm h-full">
      {/* Form Section */}
      <div className="flex-1 p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r min-w-[300px]">
        
        <form id="event-form" onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input 
              id="title" 
              name="title" 
              value={previewTitle} 
              onChange={e => setPreviewTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={previewCategoryId} onValueChange={setPreviewCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date"
                value={previewDate} 
                onChange={e => setPreviewDate(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                name="time" 
                placeholder="e.g. 10:00 AM" 
                value={previewTime} 
                onChange={e => setPreviewTime(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="e.g. Room 204 or Zoom Link" 
                value={previewLocation} 
                onChange={e => setPreviewLocation(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">About Event</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={8} 
              placeholder="What is this event about?" 
              value={previewDescription} 
              onChange={e => setPreviewDescription(e.target.value)} 
              required 
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2 pb-4">
            <Checkbox id="isDraft" name="isDraft" defaultChecked={initialData?.isDraft || false} />
            <Label htmlFor="isDraft">Save as Draft (Hide from users)</Label>
          </div>
          
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/events")} className="w-full">Cancel</Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Save Event"}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Mobile Preview Section */}
      <div className="w-full lg:w-[420px] shrink-0 bg-zinc-50 p-8 flex flex-col items-center justify-start relative overflow-y-auto hidden lg:flex">
        
        {/* Phone Frame */}
        <div className="w-[320px] shrink-0 h-[650px] bg-[#0A1128] rounded-[2.5rem] shadow-2xl border-[8px] border-zinc-900 overflow-hidden relative flex flex-col transform scale-90 lg:scale-100 origin-top">
          
          {/* Mobile Status Bar */}
          <div className="h-6 w-full flex items-center justify-between px-4 bg-[#142A68] z-20 text-[10px] font-medium text-white/90">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-white/90 rounded-sm" />
              <div className="w-3 h-3 bg-white/90 rounded-full" />
            </div>
          </div>
          
          {/* Header Bar */}
          <div className="bg-[#142A68] px-4 py-3 flex items-center gap-3 shrink-0 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">Event Details</span>
              <span className="text-[#FFD166] text-xs font-semibold leading-tight">PIWC Stoneyburn</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
            
            {/* Category Color Block */}
            <div 
              className="h-[180px] w-full shrink-0 flex flex-col items-center justify-center gap-3 transition-colors duration-500 ease-in-out" 
              style={{ backgroundColor: selectedCategory?.color || '#FF9F1C' }}
            >
              <div className="size-16 rounded-full bg-white/20 flex items-center justify-center">
                <CalendarIcon className="size-8 text-white" />
              </div>
              <div className="bg-white/20 px-4 py-1 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                {selectedCategory?.label || "CATEGORY"}
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-[#0A1128] p-5 pb-24 flex flex-col gap-5">
              
              <h1 className="text-white text-xl font-bold leading-tight">
                {previewTitle || "Event Title"}
              </h1>
              
              {/* Info Card */}
              <div className="bg-[#182138] rounded-xl flex flex-col border border-white/5">
                
                {/* Date Row */}
                <div className="flex items-center gap-4 p-4 border-b border-white/5">
                  <div className="size-10 rounded-lg bg-[#242D45] flex items-center justify-center shrink-0">
                    <CalendarIcon className="size-5" style={{ color: selectedCategory?.color || '#FF9F1C' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Date</span>
                    <span className="text-white text-sm font-semibold mt-0.5">
                      {previewDate ? new Date(previewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date"}
                    </span>
                  </div>
                </div>

                {/* Time Row */}
                <div className="flex items-center gap-4 p-4 border-b border-white/5">
                  <div className="size-10 rounded-lg bg-[#242D45] flex items-center justify-center shrink-0">
                    <Clock className="size-5" style={{ color: selectedCategory?.color || '#FF9F1C' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Time</span>
                    <span className="text-white text-sm font-semibold mt-0.5">
                      {previewTime || "Time"}
                    </span>
                  </div>
                </div>

                {/* Location Row */}
                <div className="flex items-center gap-4 p-4 border-b border-white/5">
                  <div className="size-10 rounded-lg bg-[#242D45] flex items-center justify-center shrink-0">
                    <MapPinIcon className="size-5" style={{ color: selectedCategory?.color || '#FF9F1C' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Location</span>
                    <span className="text-white text-sm font-semibold mt-0.5">
                      {previewLocation || "Location"}
                    </span>
                  </div>
                </div>

                {/* Attending Row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="size-10 rounded-lg bg-[#242D45] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: selectedCategory?.color || '#FF9F1C' }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Attending</span>
                    <span className="text-white text-sm font-semibold mt-0.5">0 people</span>
                  </div>
                </div>

              </div>
              
              {/* About Section */}
              <div className="mt-1">
                <h3 className="text-white text-lg font-bold mb-3">About This Event</h3>
                <p className="text-[14px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {previewDescription || "Event description will appear here..."}
                </p>
              </div>

            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0A1128] flex flex-col gap-3">
            <button className="w-full bg-[#3B66DF] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <CalendarIcon className="size-4" />
              RSVP for This Event
            </button>
            <button className="w-full bg-transparent border border-white/10 text-[#3B66DF] font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <CalendarIcon className="size-4" />
              Add to Calendar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
