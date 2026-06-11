import EventForm from "@/components/EventForm"

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

export default async function NewEventPage() {
  const categories = await getCategories()

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 overflow-hidden">
      <div className="flex-none p-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-zinc-900">Create New Event</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Draft a new event for the church calendar.
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <EventForm categories={categories} />
      </div>
    </div>
  )
}
