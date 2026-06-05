"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.enum(["youtube", "facebook", "telegram", "messenger", "other"]),
  color: z.string().min(1, "Color is required"),
  watchUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface PlatformModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  platform: any | null
  onSuccess: () => void
}

export function PlatformModal({ isOpen, onOpenChange, platform, onSuccess }: PlatformModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!platform
  const isYoutube = platform?.isYoutube

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      icon: "other",
      color: "#000000",
      watchUrl: "",
      isActive: true,
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (platform) {
        reset({
          label: platform.label,
          description: platform.description,
          icon: platform.icon,
          color: platform.color,
          watchUrl: platform.watchUrl || "",
          isActive: platform.isActive,
        })
      } else {
        reset({
          label: "",
          description: "",
          icon: "other",
          color: "#1877F2",
          watchUrl: "",
          isActive: true,
        })
      }
    }
  }, [isOpen, platform, reset])

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const url = isEditing 
        ? `/watch-live/platforms/${platform.id}` 
        : `/watch-live/platforms`
      const method = isEditing ? "PATCH" : "POST"

      // If it's YouTube, don't send watchUrl because it's auto-generated
      const payload = { ...data }
      if (isYoutube) {
        delete (payload as any).watchUrl
      }

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      })

      if (response?.success) {
        toast.success(`Platform ${isEditing ? 'updated' : 'added'} successfully`)
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response?.message || "Failed to save platform")
      }
    } catch (error) {
      console.error("Failed to save platform", error)
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedIcon = watch("icon")
  const isActive = watch("isActive")

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Platform' : 'Add Platform'}</DialogTitle>
          <DialogDescription>
            {isYoutube ? "The primary YouTube integration. Watch URL is handled automatically." : "Add a manual streaming link for the app to open in the browser."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Label / Name</Label>
            <Input {...register("label")} placeholder="e.g. Facebook Live" />
            {errors.label && <p className="text-xs text-red-500">{errors.label.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...register("description")} placeholder="e.g. Opens Facebook in browser" />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select disabled={isYoutube} value={selectedIcon} onValueChange={(v: any) => setValue("icon", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="other">Other Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" {...register("color")} className="w-12 h-10 p-1 cursor-pointer" />
                <Input {...register("color")} className="flex-1" placeholder="#HEX" />
              </div>
            </div>
          </div>

          {!isYoutube && (
            <div className="space-y-2">
              <Label>Watch URL</Label>
              <Input {...register("watchUrl")} placeholder="https://..." />
              {errors.watchUrl && <p className="text-xs text-red-500">{errors.watchUrl.message}</p>}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Label>Active Status</Label>
            <Switch 
              checked={isActive} 
              onCheckedChange={(v) => setValue("isActive", v)} 
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
