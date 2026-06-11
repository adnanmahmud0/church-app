import EventForm from "@/components/EventForm"
import { notFound } from "next/navigation"

async function getEvent(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${baseUrl}/events/${id}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch (error) {
    return null
  }
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${baseUrl}/events/categories`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch (error) {
    return []
  }
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const [event, categories] = await Promise.all([
    getEvent(params.id),
    getCategories()
  ])

  if (!event) {
    notFound()
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 overflow-hidden">
      <div className="flex-none p-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Event</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Make changes to {event.title}
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <EventForm initialData={event} categories={categories} />
      </div>
    </div>
  )
}
