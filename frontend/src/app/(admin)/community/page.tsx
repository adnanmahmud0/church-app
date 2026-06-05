"use client"

import * as React from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { 
  PlusIcon, 
  GripVerticalIcon, 
  MessageCircleIcon,
  GlobeIcon,
  MessageSquareIcon,
  SendIcon,
  PencilIcon,
  TrashIcon,
  EyeOffIcon,
  MoreVerticalIcon
} from "lucide-react"
import { toast } from "sonner"
import { CommunityGroupModal } from "./components/CommunityGroupModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Platform Icon Helper
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'whatsapp': return <MessageCircleIcon className="size-5 text-emerald-500" />
    case 'facebook': return <GlobeIcon className="size-5 text-blue-600" />
    case 'telegram': return <SendIcon className="size-5 text-sky-500" />
    case 'messenger': return <MessageSquareIcon className="size-5 text-violet-500" />
    default: return <GlobeIcon className="size-5 text-zinc-500" />
  }
}

// Sortable Item Component
function SortableGroupItem({ 
  group, 
  onEdit, 
  onDelete 
}: { 
  group: any, 
  onEdit: (group: any) => void,
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm ${
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      } ${!group.isActive ? "bg-zinc-50" : ""}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-zinc-900 text-zinc-400 focus:outline-none"
        >
          <GripVerticalIcon className="size-5" />
        </div>
        
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 border">
          {getPlatformIcon(group.platform)}
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${!group.isActive ? "text-zinc-500" : "text-zinc-900"}`}>
              {group.title}
            </h3>
            {!group.isActive && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                <EyeOffIcon className="size-3" /> Hidden
              </span>
            )}
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border">
              {group.platformLabel}
            </span>
          </div>
          <p className="text-sm text-zinc-500 line-clamp-1 mt-0.5">
            {group.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(group)}>
              <PencilIcon className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(group.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <TrashIcon className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const [groups, setGroups] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [groupsData, statsData] = await Promise.all([
        apiFetch("/community"),
        apiFetch("/community/admin/stats")
      ])
      
      if (groupsData?.success && statsData?.success) {
        setGroups(groupsData.data)
        setStats(statsData.data)
      }
    } catch (error) {
      console.error("Failed to fetch community data", error)
      toast.error("Failed to load community groups")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setGroups((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Prepare reorder payload (1-based index)
        const payload = newItems.map((item, index) => ({
          id: item.id,
          sortOrder: index + 1
        }))
        
        // Save to backend silently
        apiFetch("/community/reorder", {
          method: "PATCH",
          body: JSON.stringify({ items: payload })
        }).catch(err => {
          console.error("Failed to reorder", err)
          toast.error("Failed to save new order")
          fetchData() // revert
        })
        
        return newItems
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return
    
    try {
      const res = await apiFetch(`/community/${id}`, {
        method: "DELETE"
      })
      
      if (res?.success) {
        toast.success("Group deleted")
        fetchData()
      } else {
        toast.error("Failed to delete group")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const openEditModal = (group: any) => {
    setSelectedGroup(group)
    setModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedGroup(null)
    setModalOpen(true)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Community Directory</h1>
          <p className="text-zinc-500 mt-1">Manage external church groups (WhatsApp, Facebook, etc.)</p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0 shadow-sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Total Groups</p>
            <p className="text-3xl font-bold text-zinc-900 mt-2">{stats.totalGroups}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Active / Visible</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.activeGroups}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm md:col-span-2">
            <p className="text-sm font-medium text-zinc-500">By Platform</p>
            <div className="flex gap-4 mt-3">
              {stats.byPlatform.map((p: any) => (
                <div key={p.platform} className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-md border">
                  {getPlatformIcon(p.platform)}
                  <span className="font-medium text-sm">{p.count}</span>
                </div>
              ))}
              {stats.byPlatform.length === 0 && (
                <p className="text-sm text-zinc-400">No platforms used yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-zinc-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-zinc-900">Groups Directory</h2>
          <span className="text-xs text-zinc-500">Drag to reorder how they appear in the app</span>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <MessageCircleIcon className="size-12 mx-auto text-zinc-300 mb-3" />
              <p>No community groups added yet.</p>
              <Button variant="link" onClick={openCreateModal} className="mt-2">
                Create your first group
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groups.map(g => g.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {groups.map((group) => (
                    <SortableGroupItem
                      key={group.id}
                      group={group}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <CommunityGroupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        group={selectedGroup}
        onSuccess={fetchData}
      />
    </div>
  )
}
