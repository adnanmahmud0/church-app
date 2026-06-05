"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  joinLink: z.string().url("Must be a valid URL").min(1, "Join link is required"),
  platform: z.enum(["whatsapp", "facebook", "telegram", "messenger", "other"]),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CommunityGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: any | null
  onSuccess: () => void
}

export function CommunityGroupModal({
  open,
  onOpenChange,
  group,
  onSuccess,
}: CommunityGroupModalProps) {
  const isEditing = !!group
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      joinLink: "",
      platform: "whatsapp",
      isActive: true,
    },
  })

  React.useEffect(() => {
    if (group) {
      form.reset({
        title: group.title,
        description: group.description,
        joinLink: group.joinLink,
        platform: group.platform,
        isActive: group.isActive,
      })
    } else {
      form.reset({
        title: "",
        description: "",
        joinLink: "",
        platform: "whatsapp",
        isActive: true,
      })
    }
  }, [group, form, open])

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const url = isEditing 
        ? `/community/${group.id}` 
        : `/community`
      const method = isEditing ? "PATCH" : "POST"

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(data),
      })

      if (response?.success) {
        toast.success(`Group ${isEditing ? 'updated' : 'created'} successfully`)
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response?.message || "Failed to save group")
      }
    } catch (error) {
      console.error("Failed to save community group", error)
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Community Group" : "Add Community Group"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Youth Night: Ignite" {...form.register("title")} />
            {form.formState.errors.title && <p className="text-sm font-medium text-destructive">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Brief description about the group..." 
              className="resize-none h-24"
              {...form.register("description")} 
            />
            {form.formState.errors.description && <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinLink">Join Link URL</Label>
            <Input id="joinLink" placeholder="https://chat.whatsapp.com/..." {...form.register("joinLink")} />
            {form.formState.errors.joinLink && <p className="text-sm font-medium text-destructive">{form.formState.errors.joinLink.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select 
              value={form.watch("platform")} 
              onValueChange={(value: any) => form.setValue("platform", value)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="facebook">Facebook Group</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="messenger">Messenger</SelectItem>
                <SelectItem value="other">Other / Web</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.platform && <p className="text-sm font-medium text-destructive">{form.formState.errors.platform.message}</p>}
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <div className="text-[0.8rem] text-muted-foreground">
                Display this group in the app directory
              </div>
            </div>
            <Switch
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
