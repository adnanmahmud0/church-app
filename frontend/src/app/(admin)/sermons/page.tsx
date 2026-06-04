"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SearchIcon, PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon, ImageIcon, EyeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/media-picker";
import { apiFetch } from "@/lib/api";

type SermonSeries = {
  _id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  sermonCount?: number;
};

type Sermon = {
  id: string;
  title: string;
  speaker: string;
  series?: { _id: string; name: string };
  date: string;
  duration_seconds?: number;
  audio_url?: string;
  thumbnail_url?: string;
  key_scripture?: string;
  description?: string;
  tags?: string[];
};

export default function SermonsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sermons");

  // --- SERMONS STATE ---
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [sermonSearch, setSermonSearch] = useState("");
  const [isSermonAddOpen, setIsSermonAddOpen] = useState(false);
  const [isSermonEditOpen, setIsSermonEditOpen] = useState(false);
  const [isSermonDeleteOpen, setIsSermonDeleteOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [sermonFormData, setSermonFormData] = useState({
    title: "", speaker: "", series: "", date: new Date().toISOString().split('T')[0],
    duration_seconds: 0, audio_url: "", video_url: "", thumbnail_url: "", key_scripture: "", description: "", tags: "",
  });

  // --- SERIES STATE ---
  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [seriesSearch, setSeriesSearch] = useState("");
  const [isSeriesAddOpen, setIsSeriesAddOpen] = useState(false);
  const [isSeriesEditOpen, setIsSeriesEditOpen] = useState(false);
  const [isSeriesDeleteOpen, setIsSeriesDeleteOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<SermonSeries | null>(null);
  const [seriesFormData, setSeriesFormData] = useState({ name: "", description: "", cover_image_url: "" });

  const [isLoading, setIsLoading] = useState(false);

  // --- MEDIA PICKER STATE ---
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ form: "sermon" | "series", field: string, type: "image" | "audio" | "video" } | null>(null);

  const fetchSermons = async () => {
    try {
      const res = await apiFetch(`/sermons?search=${sermonSearch}`);
      if (res.data && res.data.data) {
        setSermons(res.data.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load sermons');
    }
  };

  const fetchSeriesList = async () => {
    try {
      const res = await apiFetch('/sermon-series');
      if (res.data) {
        setSeriesList(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load sermon series');
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [sermonSearch]);

  useEffect(() => {
    fetchSeriesList();
  }, []);

  // --- SERMON HANDLERS ---
  const handleSermonAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...sermonFormData, tags: sermonFormData.tags ? sermonFormData.tags.split(',').map(t => t.trim()) : [], duration_seconds: Number(sermonFormData.duration_seconds) };
      await apiFetch('/sermons', { method: 'POST', body: JSON.stringify(payload) });
      toast.success("Sermon created successfully");
      setIsSermonAddOpen(false);
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || "Failed to create sermon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSermonEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSermon) return;
    setIsLoading(true);
    try {
      const payload = { ...sermonFormData, tags: sermonFormData.tags ? sermonFormData.tags.split(',').map(t => t.trim()) : [], duration_seconds: Number(sermonFormData.duration_seconds) };
      await apiFetch(`/sermons/${selectedSermon.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      toast.success("Sermon updated successfully");
      setIsSermonEditOpen(false);
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || "Failed to update sermon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSermonDelete = async () => {
    if (!selectedSermon) return;
    setIsLoading(true);
    try {
      await apiFetch(`/sermons/${selectedSermon.id}`, { method: 'DELETE' });
      toast.success("Sermon deleted successfully");
      setIsSermonDeleteOpen(false);
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete sermon");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SERIES HANDLERS ---
  const handleSeriesAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiFetch('/sermon-series', { method: 'POST', body: JSON.stringify(seriesFormData) });
      toast.success("Series created successfully");
      setIsSeriesAddOpen(false);
      fetchSeriesList();
    } catch (err: any) {
      toast.error(err.message || "Failed to create series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    setIsLoading(true);
    try {
      await apiFetch(`/sermon-series/${selectedSeries._id}`, { method: 'PATCH', body: JSON.stringify(seriesFormData) });
      toast.success("Series updated successfully");
      setIsSeriesEditOpen(false);
      fetchSeriesList();
    } catch (err: any) {
      toast.error(err.message || "Failed to update series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesDelete = async () => {
    if (!selectedSeries) return;
    setIsLoading(true);
    try {
      await apiFetch(`/sermon-series/${selectedSeries._id}`, { method: 'DELETE' });
      toast.success("Series deleted successfully");
      setIsSeriesDeleteOpen(false);
      fetchSeriesList();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (!mediaPickerTarget) return;
    
    if (mediaPickerTarget.form === "sermon") {
      setSermonFormData(prev => ({ ...prev, [mediaPickerTarget.field]: url }));
    } else {
      setSeriesFormData(prev => ({ ...prev, [mediaPickerTarget.field]: url }));
    }
  };

  const openMediaPicker = (form: "sermon" | "series", field: string, type: "image" | "audio" | "video") => {
    setMediaPickerTarget({ form, field, type });
    setIsMediaPickerOpen(true);
  };

  const filteredSeries = seriesList.filter(s => s.name.toLowerCase().includes(seriesSearch.toLowerCase()));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sermons Management</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sermons">Sermons</TabsTrigger>
          <TabsTrigger value="series">Sermon Series</TabsTrigger>
        </TabsList>

        <TabsContent value="sermons" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sermons..." className="pl-8" value={sermonSearch} onChange={(e) => setSermonSearch(e.target.value)} />
            </div>
            <Button onClick={() => {
              setSermonFormData({ title: "", speaker: "", series: "", date: new Date().toISOString().split('T')[0], duration_seconds: 0, audio_url: "", video_url: "", thumbnail_url: "", key_scripture: "", description: "", tags: "" });
              setIsSermonAddOpen(true);
            }}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Sermon
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Speaker</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Series</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {sermons.length === 0 ? (
                  <tr><td colSpan={5} className="h-24 text-center">No sermons found.</td></tr>
                ) : (
                  sermons.map((sermon) => (
                    <tr key={sermon.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{sermon.title}</td>
                      <td className="p-4 align-middle">{sermon.speaker}</td>
                      <td className="p-4 align-middle">{sermon.series?.name || "None"}</td>
                      <td className="p-4 align-middle">{new Date(sermon.date).toLocaleDateString()}</td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontalIcon className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/sermons/${sermon.id}`)}>
                              <EyeIcon className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSermon(sermon);
                              setSermonFormData({ ...sermon, date: new Date(sermon.date).toISOString().split('T')[0], tags: sermon.tags ? sermon.tags.join(", ") : "", series: sermon.series?._id || "", duration_seconds: sermon.duration_seconds || 0, audio_url: sermon.audio_url || "", video_url: sermon.video_url || "", thumbnail_url: sermon.thumbnail_url || "", key_scripture: sermon.key_scripture || "", description: sermon.description || "" });
                              setIsSermonEditOpen(true);
                            }}><PencilIcon className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedSermon(sermon); setIsSermonDeleteOpen(true); }} className="text-red-600"><TrashIcon className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search series..." className="pl-8" value={seriesSearch} onChange={(e) => setSeriesSearch(e.target.value)} />
            </div>
            <Button onClick={() => {
              setSeriesFormData({ name: "", description: "", cover_image_url: "" });
              setIsSeriesAddOpen(true);
            }}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Series
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sermons Count</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredSeries.length === 0 ? (
                  <tr><td colSpan={3} className="h-24 text-center">No series found.</td></tr>
                ) : (
                  filteredSeries.map((series) => (
                    <tr key={series._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{series.name}</td>
                      <td className="p-4 align-middle">{series.sermonCount || 0}</td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontalIcon className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedSeries(series);
                              setSeriesFormData({ name: series.name, description: series.description || "", cover_image_url: series.cover_image_url || "" });
                              setIsSeriesEditOpen(true);
                            }}><PencilIcon className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedSeries(series); setIsSeriesDeleteOpen(true); }} className="text-red-600"><TrashIcon className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* SERMON MODALS */}
      <Dialog open={isSermonAddOpen} onOpenChange={setIsSermonAddOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSermonAddSubmit}>
            <DialogHeader><DialogTitle>Add New Sermon</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="title">Title *</Label><Input id="title" required value={sermonFormData.title} onChange={(e) => setSermonFormData({...sermonFormData, title: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="speaker">Speaker *</Label><Input id="speaker" required value={sermonFormData.speaker} onChange={(e) => setSermonFormData({...sermonFormData, speaker: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="series">Series</Label>
                <select id="series" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={sermonFormData.series} onChange={(e) => setSermonFormData({...sermonFormData, series: e.target.value})}>
                  <option value="">No Series</option>
                  {seriesList.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                </select>
              </div>
              <div className="grid gap-2"><Label htmlFor="date">Date *</Label><Input id="date" type="date" required value={sermonFormData.date} onChange={(e) => setSermonFormData({...sermonFormData, date: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="duration_seconds">Duration (Seconds)</Label><Input id="duration_seconds" type="number" value={sermonFormData.duration_seconds} onChange={(e) => setSermonFormData({...sermonFormData, duration_seconds: Number(e.target.value)})} /></div>
              <div className="grid gap-2"><Label htmlFor="audio_url">Audio URL</Label>
                <div className="flex gap-2">
                  <Input id="audio_url" disabled={!!sermonFormData.video_url} value={sermonFormData.audio_url} onChange={(e) => setSermonFormData({...sermonFormData, audio_url: e.target.value})} />
                  <Button type="button" disabled={!!sermonFormData.video_url} variant="outline" onClick={() => openMediaPicker("sermon", "audio_url", "audio")}>Select</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center -my-2 relative z-10">
                <span className="bg-background px-2 text-xs text-muted-foreground font-medium uppercase">OR</span>
              </div>

              <div className="grid gap-2"><Label htmlFor="video_url">Video URL</Label>
                <div className="flex gap-2">
                  <Input id="video_url" disabled={!!sermonFormData.audio_url} value={sermonFormData.video_url} onChange={(e) => setSermonFormData({...sermonFormData, video_url: e.target.value})} />
                  <Button type="button" disabled={!!sermonFormData.audio_url} variant="outline" onClick={() => openMediaPicker("sermon", "video_url", "video")}>Select</Button>
                </div>
              </div>
              <div className="grid gap-2"><Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <div className="flex gap-2">
                  <Input id="thumbnail_url" value={sermonFormData.thumbnail_url} onChange={(e) => setSermonFormData({...sermonFormData, thumbnail_url: e.target.value})} />
                  <Button type="button" variant="outline" onClick={() => openMediaPicker("sermon", "thumbnail_url", "image")}>Select</Button>
                </div>
              </div>
              <div className="grid gap-2"><Label htmlFor="key_scripture">Key Scripture</Label><Input id="key_scripture" value={sermonFormData.key_scripture} onChange={(e) => setSermonFormData({...sermonFormData, key_scripture: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={sermonFormData.description} onChange={(e) => setSermonFormData({...sermonFormData, description: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" value={sermonFormData.tags} onChange={(e) => setSermonFormData({...sermonFormData, tags: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSermonAddOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create Sermon"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSermonEditOpen} onOpenChange={setIsSermonEditOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSermonEditSubmit}>
            <DialogHeader><DialogTitle>Edit Sermon</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="edit-title">Title *</Label><Input id="edit-title" required value={sermonFormData.title} onChange={(e) => setSermonFormData({...sermonFormData, title: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-speaker">Speaker *</Label><Input id="edit-speaker" required value={sermonFormData.speaker} onChange={(e) => setSermonFormData({...sermonFormData, speaker: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-series">Series</Label>
                <select id="edit-series" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={sermonFormData.series} onChange={(e) => setSermonFormData({...sermonFormData, series: e.target.value})}>
                  <option value="">No Series</option>
                  {seriesList.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                </select>
              </div>
              <div className="grid gap-2"><Label htmlFor="edit-date">Date *</Label><Input id="edit-date" type="date" required value={sermonFormData.date} onChange={(e) => setSermonFormData({...sermonFormData, date: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-duration_seconds">Duration (Seconds)</Label><Input id="edit-duration_seconds" type="number" value={sermonFormData.duration_seconds} onChange={(e) => setSermonFormData({...sermonFormData, duration_seconds: Number(e.target.value)})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-audio_url">Audio URL</Label>
                <div className="flex gap-2">
                  <Input id="edit-audio_url" disabled={!!sermonFormData.video_url} value={sermonFormData.audio_url} onChange={(e) => setSermonFormData({...sermonFormData, audio_url: e.target.value})} />
                  <Button type="button" disabled={!!sermonFormData.video_url} variant="outline" onClick={() => openMediaPicker("sermon", "audio_url", "audio")}>Select</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center -my-2 relative z-10">
                <span className="bg-background px-2 text-xs text-muted-foreground font-medium uppercase">OR</span>
              </div>

              <div className="grid gap-2"><Label htmlFor="edit-video_url">Video URL</Label>
                <div className="flex gap-2">
                  <Input id="edit-video_url" disabled={!!sermonFormData.audio_url} value={sermonFormData.video_url} onChange={(e) => setSermonFormData({...sermonFormData, video_url: e.target.value})} />
                  <Button type="button" disabled={!!sermonFormData.audio_url} variant="outline" onClick={() => openMediaPicker("sermon", "video_url", "video")}>Select</Button>
                </div>
              </div>
              <div className="grid gap-2"><Label htmlFor="edit-thumbnail_url">Thumbnail URL</Label>
                <div className="flex gap-2">
                  <Input id="edit-thumbnail_url" value={sermonFormData.thumbnail_url} onChange={(e) => setSermonFormData({...sermonFormData, thumbnail_url: e.target.value})} />
                  <Button type="button" variant="outline" onClick={() => openMediaPicker("sermon", "thumbnail_url", "image")}>Select</Button>
                </div>
              </div>
              <div className="grid gap-2"><Label htmlFor="edit-key_scripture">Key Scripture</Label><Input id="edit-key_scripture" value={sermonFormData.key_scripture} onChange={(e) => setSermonFormData({...sermonFormData, key_scripture: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" value={sermonFormData.description} onChange={(e) => setSermonFormData({...sermonFormData, description: e.target.value})} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-tags">Tags (comma separated)</Label><Input id="edit-tags" value={sermonFormData.tags} onChange={(e) => setSermonFormData({...sermonFormData, tags: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSermonEditOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save changes"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSermonDeleteOpen} onOpenChange={setIsSermonDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Are you sure you want to delete the sermon <span className="font-semibold">{selectedSermon?.title}</span>? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="mt-4"><Button type="button" variant="outline" onClick={() => setIsSermonDeleteOpen(false)}>Cancel</Button><Button type="button" variant="destructive" onClick={handleSermonDelete} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete Sermon"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SERIES MODALS */}
      <Dialog open={isSeriesAddOpen} onOpenChange={setIsSeriesAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSeriesAddSubmit}>
            <DialogHeader><DialogTitle>Add New Series</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="series-name">Name</Label><Input id="series-name" required value={seriesFormData.name} onChange={(e) => setSeriesFormData({...seriesFormData, name: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSeriesAddOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Series"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSeriesEditOpen} onOpenChange={setIsSeriesEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSeriesEditSubmit}>
            <DialogHeader><DialogTitle>Edit Series</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="edit-series-name">Name</Label><Input id="edit-series-name" required value={seriesFormData.name} onChange={(e) => setSeriesFormData({...seriesFormData, name: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSeriesEditOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save changes"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSeriesDeleteOpen} onOpenChange={setIsSeriesDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Are you sure you want to delete the series <span className="font-semibold">{selectedSeries?.name}</span>? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="mt-4"><Button type="button" variant="outline" onClick={() => setIsSeriesDeleteOpen(false)}>Cancel</Button><Button type="button" variant="destructive" onClick={handleSeriesDelete} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete Series"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MEDIA PICKER */}
      <MediaPicker 
        open={isMediaPickerOpen} 
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleMediaSelect}
        allowedTypes={mediaPickerTarget ? [mediaPickerTarget.type] : ["image", "audio", "video"]}
      />
    </div>
  );
}
