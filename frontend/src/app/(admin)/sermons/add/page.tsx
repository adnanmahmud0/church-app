"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/media-picker";
import { apiFetch } from "@/lib/api";
import { ArrowLeftIcon } from "lucide-react";
import { SermonMobilePreview } from "@/components/sermon-mobile-preview";

export default function AddSermonPage() {
  const router = useRouter();
  const [sermonFormData, setSermonFormData] = useState({
    title: "", speaker: "", category: "", date: new Date().toISOString().split('T')[0],
    duration_seconds: 0, video_url: "", thumbnail_url: "", key_scripture: "", description: "", tags: "",
  });
  const [categoryList, setCategoryList] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ field: string, type: "image" | "video" } | null>(null);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    try {
      const res = await apiFetch('/sermon-category');
      if (res.data) setCategoryList(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load sermon series');
    }
  };

  const handleSermonAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = { ...sermonFormData, tags: sermonFormData.tags ? sermonFormData.tags.split(',').map(t => t.trim()) : [], duration_seconds: Number(sermonFormData.duration_seconds) };
      if (!payload.category) {
        delete payload.category;
      }
      await apiFetch('/sermons', { method: 'POST', body: JSON.stringify(payload) });
      toast.success("Sermon created successfully");
      router.push("/sermons");
    } catch (err: any) {
      toast.error(err.message || "Failed to create sermon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (!mediaPickerTarget) return;
    setSermonFormData(prev => ({ ...prev, [mediaPickerTarget.field]: url }));
  };

  const openMediaPicker = (field: string, type: "image" | "video") => {
    setMediaPickerTarget({ field, type });
    setIsMediaPickerOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/sermons")}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add New Sermon</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full max-w-2xl bg-card border rounded-lg p-6">
          <form onSubmit={handleSermonAddSubmit} className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="title">Title *</Label><Input id="title" required value={sermonFormData.title} onChange={(e) => setSermonFormData({...sermonFormData, title: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="speaker">Speaker *</Label><Input id="speaker" required value={sermonFormData.speaker} onChange={(e) => setSermonFormData({...sermonFormData, speaker: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="series">Category</Label>
              <select id="series" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={sermonFormData.category} onChange={(e) => setSermonFormData({...sermonFormData, category: e.target.value})}>
                <option value="">No Category</option>
                {categoryList.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="grid gap-2"><Label htmlFor="date">Date *</Label><Input id="date" type="date" required value={sermonFormData.date} onChange={(e) => setSermonFormData({...sermonFormData, date: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="duration_seconds">Duration (Seconds)</Label><Input id="duration_seconds" type="number" value={sermonFormData.duration_seconds} onChange={(e) => setSermonFormData({...sermonFormData, duration_seconds: Number(e.target.value)})} /></div>
            <div className="grid gap-2"><Label htmlFor="video_url">YouTube Video Link</Label>
              <Input id="video_url" placeholder="https://www.youtube.com/watch?v=..." value={sermonFormData.video_url} onChange={(e) => setSermonFormData({...sermonFormData, video_url: e.target.value})} />
            </div>
            <div className="grid gap-2"><Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <div className="flex gap-2">
                <Input id="thumbnail_url" value={sermonFormData.thumbnail_url} onChange={(e) => setSermonFormData({...sermonFormData, thumbnail_url: e.target.value})} />
                <Button type="button" variant="outline" onClick={() => openMediaPicker("thumbnail_url", "image")}>Select</Button>
              </div>
            </div>
            <div className="grid gap-2"><Label htmlFor="key_scripture">Key Scripture</Label><Input id="key_scripture" value={sermonFormData.key_scripture} onChange={(e) => setSermonFormData({...sermonFormData, key_scripture: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={sermonFormData.description} onChange={(e) => setSermonFormData({...sermonFormData, description: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" value={sermonFormData.tags} onChange={(e) => setSermonFormData({...sermonFormData, tags: e.target.value})} /></div>
            
            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/sermons")}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create Sermon"}</Button>
            </div>
          </form>
        </div>
        
        <div className="lg:w-[400px] flex justify-center lg:sticky lg:top-8">
          <SermonMobilePreview data={sermonFormData} />
        </div>
      </div>

      <MediaPicker 
        open={isMediaPickerOpen} 
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleMediaSelect}
        allowedTypes={mediaPickerTarget ? [mediaPickerTarget.type] : ["image"]}
      />
    </div>
  );
}
