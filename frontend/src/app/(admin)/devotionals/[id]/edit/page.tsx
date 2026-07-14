"use client"

import { useEffect, useState, use } from "react"
import { apiFetch } from "@/lib/api"
import DevotionalForm from "../../components/DevotionalForm"
import { toast } from "sonner"
import { PageSkeleton } from "@/components/page-skeleton"

export default function EditDevotionalPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = use(params)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Find it from the list for now since we don't have a GET /devotionals/:id endpoint
        // Wait, if there isn't one, we can just fetch all and find, or just assume the backend has it.
        // If there's no GET /devotionals/:id we will fetch all and find it.
        const res = await apiFetch(`/devotionals?limit=100`)
        if (res.success) {
          const item = res.data.devotionals.find((d: any) => d.id === id)
          if(item) setData(item)
          else toast.error("Devotional not found")
        }
      } catch (error) {
        toast.error("Failed to load devotional")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (isLoading) {
    return <PageSkeleton />
  }

  if (!data) {
    return <div className="p-8">Devotional not found.</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 min-h-screen">
      <DevotionalForm initialData={data} />
    </div>
  )
}
