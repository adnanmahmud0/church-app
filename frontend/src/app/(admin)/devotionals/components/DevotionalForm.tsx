"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { BookIcon, HeartIcon, ChevronLeftIcon, StarIcon, ShareIcon } from "lucide-react"

export default function DevotionalForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  
  // Preview States
  const [previewTitle, setPreviewTitle] = useState("")
  const [previewScriptureRef, setPreviewScriptureRef] = useState("")
  const [previewScriptureQuote, setPreviewScriptureQuote] = useState("")
  const [previewReflection, setPreviewReflection] = useState("")
  const [previewPrayer, setPreviewPrayer] = useState("")

  useEffect(() => {
    if(initialData) {
      setPreviewTitle(initialData.title || "")
      setPreviewScriptureRef(initialData.scriptureRef || "")
      setPreviewScriptureQuote(initialData.scriptureQuote || "")
      setPreviewReflection(initialData.reflection || "")
      setPreviewPrayer(initialData.prayer || "")
    } else {
      setPreviewTitle("")
      setPreviewScriptureRef("")
      setPreviewScriptureQuote("")
      setPreviewReflection("")
      setPreviewPrayer("")
    }
  }, [initialData])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const payload = {
      title: formData.get("title") as string,
      scriptureRef: formData.get("scriptureRef") as string,
      scriptureQuote: formData.get("scriptureQuote") as string,
      reflection: formData.get("reflection") as string,
      prayer: formData.get("prayer") as string,
      isDraft: formData.get("isDraft") === "on",
    }

    try {
      if (initialData) {
        await apiFetch(`/devotionals/${initialData.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Devotional updated")
      } else {
        await apiFetch("/devotionals", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Devotional created")
      }
      router.push("/devotionals")
    } catch (error) {
      toast.error("Failed to save devotional")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 bg-white border rounded-xl overflow-hidden shadow-sm">
      {/* Form Section */}
      <div className="flex-1 p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r min-w-[300px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Devotional' : 'Create Devotional'}</h2>
          <Button variant="ghost" onClick={() => router.push("/devotionals")}>Cancel</Button>
        </div>
        
        <form id="devotional-form" onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (max 80 chars)</Label>
            <Input 
              id="title" 
              name="title" 
              maxLength={80}
              value={previewTitle} 
              onChange={e => setPreviewTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scriptureRef">Scripture Reference</Label>
            <Input 
              id="scriptureRef" 
              name="scriptureRef" 
              placeholder="e.g. Psalm 23:2" 
              value={previewScriptureRef} 
              onChange={e => setPreviewScriptureRef(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scriptureQuote">Scripture Quote</Label>
            <Textarea 
              id="scriptureQuote" 
              name="scriptureQuote" 
              rows={3} 
              value={previewScriptureQuote} 
              onChange={e => setPreviewScriptureQuote(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflection">Reflection</Label>
            <Textarea 
              id="reflection" 
              name="reflection" 
              rows={12} 
              placeholder="Main body of the devotional..." 
              value={previewReflection} 
              onChange={e => setPreviewReflection(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prayer">Prayer</Label>
            <Textarea 
              id="prayer" 
              name="prayer" 
              rows={3} 
              placeholder="Short prayer text..." 
              value={previewPrayer} 
              onChange={e => setPreviewPrayer(e.target.value)} 
              required 
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2 pb-4">
            <Checkbox id="isDraft" name="isDraft" defaultChecked={initialData?.isDraft || false} />
            <Label htmlFor="isDraft">Save as Draft (Hide from users)</Label>
          </div>
          
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/devotionals")}>Cancel</Button>
            <Button type="submit">Save Devotional</Button>
          </div>
        </form>
      </div>
      
      {/* Mobile Preview Section */}
      <div className="w-full lg:w-[420px] shrink-0 bg-slate-900 p-8 flex flex-col items-center justify-start relative overflow-y-auto">
        <div className="absolute top-4 left-4 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:block">Mobile Preview</div>
        
        {/* Phone Frame */}
        <div className="w-[320px] shrink-0 h-[650px] bg-[#0A0F24] rounded-[2.5rem] shadow-2xl border-[8px] border-slate-800 overflow-hidden relative flex flex-col mt-4 transform scale-90 lg:scale-100 origin-top">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-50"></div>
          
          {/* App Header */}
          <div className="bg-[#0A0F24] text-white p-4 pt-10 flex items-center justify-between border-b border-slate-800 shrink-0">
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="font-bold">Devotional</span>
            <StarIcon className="w-5 h-5 opacity-70" />
          </div>
          
          {/* App Content */}
          <div className="flex-1 overflow-y-auto bg-[#10172A] text-white">
            {/* Header Image/Color Area */}
            <div className="bg-blue-600 p-6 pb-8">
              <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-2">
                DAILY DEVOTIONAL
              </div>
              <h1 className="text-3xl font-extrabold leading-tight">
                {previewTitle || 'Title Goes Here'}
              </h1>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Scripture Box */}
              <div className="bg-[#1E293B] p-4 rounded-xl border-l-4 border-blue-500 shadow-md">
                <h3 className="text-blue-400 font-bold text-sm mb-2">{previewScriptureRef?.toUpperCase() || 'REFERENCE'}</h3>
                <p className="italic text-slate-200 text-[15px] leading-relaxed">
                  "{previewScriptureQuote || 'Verse quote will appear here...'}"
                </p>
              </div>
              
              {/* Reflection */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-100 font-bold">
                  <BookIcon className="w-5 h-5 text-blue-500" /> Reflection
                </div>
                <div className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-line">
                  {previewReflection || 'Reflection text will appear here...'}
                </div>
              </div>
              
              {/* Prayer */}
              <div className="bg-[#172033] p-5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2 text-slate-100 font-bold">
                  <HeartIcon className="w-4 h-4 text-purple-400" /> Prayer
                </div>
                <p className="italic text-slate-400 text-sm leading-relaxed">
                  {previewPrayer || 'Prayer text will appear here...'}
                </p>
              </div>
              
              <div className="pt-4 pb-8 space-y-3">
                <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl">
                  Mark as Read
                </Button>
                <Button type="button" variant="outline" className="w-full border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800 py-6 rounded-xl border-2">
                  <ShareIcon className="w-4 h-4 mr-2" /> Share This Devotional
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
