"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { PlatformModal } from "./PlatformModal"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Trash2, Plus, ExternalLink, Video, Globe, Send, MessageCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const iconMap: Record<string, any> = {
  youtube: Video,
  facebook: Globe,
  telegram: Send,
  messenger: MessageCircle,
  other: ExternalLink
}

function SortableItem({ item, onEdit, onDelete, onToggle }: { item: any, onEdit: (item: any) => void, onDelete: (id: string) => void, onToggle: (id: string, active: boolean) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const IconComponent = iconMap[item.icon] || ExternalLink

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border rounded-lg shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
        <IconComponent className="h-4 w-4" style={{ color: item.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none mb-1">{item.label}</p>
        <p className="text-xs text-muted-foreground truncate">{item.watchUrl || "Auto-generated from channel"}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          checked={item.isActive} 
          onCheckedChange={(checked) => onToggle(item.id, checked)}
          title="Toggle visibility"
        />
        
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        
        {item.isYoutube ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 cursor-not-allowed" disabled title="Cannot delete built-in YouTube">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function OtherPlatformsTable() {
  const [platforms, setPlatforms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<any | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchPlatforms = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch("/watch-live/platforms")
      if (res?.success) {
        setPlatforms(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch platforms", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return
    try {
      const res = await apiFetch(`/watch-live/platforms/${id}`, { method: "DELETE" })
      if (res?.success) {
        toast.success("Platform deleted")
        fetchPlatforms()
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      // Optimistic update
      setPlatforms(prev => prev.map(p => p.id === id ? { ...p, isActive } : p))
      
      const res = await apiFetch(`/watch-live/platforms/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive })
      })
      if (!res?.success) {
        toast.error("Failed to update status")
        fetchPlatforms() // Revert on fail
      }
    } catch (error) {
      toast.error("An error occurred")
      fetchPlatforms()
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      setPlatforms((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        const payload = newArray.map((item, index) => ({
          id: item.id,
          sortOrder: index
        }))

        // Save order silently
        apiFetch("/watch-live/platforms/reorder", {
          method: "PATCH",
          body: JSON.stringify({ items: payload })
        }).catch(() => toast.error("Failed to save new order"))
        
        return newArray
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Streaming Platforms</CardTitle>
          <CardDescription>Drag to reorder. The top active platform will be the primary action in the app.</CardDescription>
        </div>
        <Button onClick={() => { setEditingPlatform(null); setIsModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Platform
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading...</div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={platforms.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <SortableItem 
                    key={platform.id} 
                    item={platform} 
                    onEdit={(item) => { setEditingPlatform(item); setIsModalOpen(true) }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>

      <PlatformModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        platform={editingPlatform}
        onSuccess={fetchPlatforms}
      />
    </Card>
  )
}
