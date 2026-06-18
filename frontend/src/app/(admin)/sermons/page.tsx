"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SearchIcon, PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon, SmartphoneIcon, EyeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SermonsListMobilePreview } from "@/components/sermons-list-mobile-preview";
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

export type SermonSeries = {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  sermonCount?: number;
};

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  category?: { _id?: string; id?: string; name: string };
  series?: { _id: string; name: string }; // Keep for backwards compatibility if needed
  date: string;
  duration_seconds?: number;
  video_url?: string;
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
  const [isSermonDeleteOpen, setIsSermonDeleteOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  // --- SERIES STATE ---
  const [categoryList, setCategoryList] = useState<SermonSeries[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryAddOpen, setIsCategoryAddOpen] = useState(false);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
  const [isCategoryDeleteOpen, setIsCategoryDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SermonSeries | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "", cover_image_url: "" });

  const [isLoading, setIsLoading] = useState(false);

  // --- MEDIA PICKER STATE ---
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ form: "sermon" | "series", field: string, type: "image" | "video" } | null>(null);

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

  const fetchCategoryList = async () => {
    try {
      const res = await apiFetch('/sermon-category');
      if (res.data) {
        setCategoryList(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load sermon series');
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [sermonSearch]);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // --- SERMON HANDLERS ---

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
  const handleCategoryAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiFetch('/sermon-category', { method: 'POST', body: JSON.stringify(categoryFormData) });
      toast.success("Category created successfully");
      setIsCategoryAddOpen(false);
      fetchCategoryList();
    } catch (err: any) {
      toast.error(err.message || "Failed to create series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      await apiFetch(`/sermon-category/${selectedCategory.id}`, { method: 'PATCH', body: JSON.stringify(categoryFormData) });
      toast.success("Category updated successfully");
      setIsCategoryEditOpen(false);
      fetchCategoryList();
    } catch (err: any) {
      toast.error(err.message || "Failed to update series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryDelete = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      await apiFetch(`/sermon-category/${selectedCategory.id}`, { method: 'DELETE' });
      toast.success("Category deleted successfully");
      setIsCategoryDeleteOpen(false);
      fetchCategoryList();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete series");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (!mediaPickerTarget) return;
    
    if (mediaPickerTarget.form === "sermon") {
      // Logic for updating sermon form state would go here
    } else {
      setCategoryFormData(prev => ({ ...prev, [mediaPickerTarget.field]: url }));
    }
  };

  const openMediaPicker = (form: "sermon" | "series", field: string, type: "image" | "video") => {
    setMediaPickerTarget({ form, field, type });
    setIsMediaPickerOpen(true);
  };

  const filteredSeries = categoryList.filter(s => s.name.toLowerCase().includes(categorySearch.toLowerCase()));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Sermons Management</h2>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sermons">Sermons</TabsTrigger>
          <TabsTrigger value="series">Sermon Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="sermons" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sermons..." className="pl-8" value={sermonSearch} onChange={(e) => setSermonSearch(e.target.value)} />
            </div>
            <Button onClick={() => router.push('/sermons/add')}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Sermon
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Speaker</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
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
                      <td className="p-4 align-middle">{sermon.category?.name || sermon.series?.name || "None"}</td>
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
                            <DropdownMenuItem onClick={() => router.push(`/sermons/${sermon.id}/edit`)}>
                              <PencilIcon className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
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
              <Input placeholder="Search series..." className="pl-8" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
            </div>
            <Button onClick={() => {
              setCategoryFormData({ name: "", description: "", cover_image_url: "" });
              setIsCategoryAddOpen(true);
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
                  <tr><td colSpan={3} className="h-24 text-center">No categories found.</td></tr>
                ) : (
                  filteredSeries.map((series) => (
                    <tr key={series.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{series.name}</td>
                      <td className="p-4 align-middle">{series.sermonCount || 0}</td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontalIcon className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedCategory(series);
                              setCategoryFormData({ name: series.name, description: series.description || "", cover_image_url: series.cover_image_url || "" });
                              setIsCategoryEditOpen(true);
                            }}><PencilIcon className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedCategory(series); setIsCategoryDeleteOpen(true); }} className="text-red-600"><TrashIcon className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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

      <Dialog open={isSermonDeleteOpen} onOpenChange={setIsSermonDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Are you sure you want to delete the sermon <span className="font-semibold">{selectedSermon?.title}</span>? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="mt-4"><Button type="button" variant="outline" onClick={() => setIsSermonDeleteOpen(false)}>Cancel</Button><Button type="button" variant="destructive" onClick={handleSermonDelete} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete Sermon"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SERIES MODALS */}
      <Dialog open={isCategoryAddOpen} onOpenChange={setIsCategoryAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCategoryAddSubmit}>
            <DialogHeader><DialogTitle>Add New Series</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="series-name">Name</Label><Input id="series-name" required value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsCategoryAddOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Category"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryEditOpen} onOpenChange={setIsCategoryEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCategoryEditSubmit}>
            <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="edit-series-name">Name</Label><Input id="edit-series-name" required value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsCategoryEditOpen(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save changes"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDeleteOpen} onOpenChange={setIsCategoryDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Are you sure you want to delete the series <span className="font-semibold">{selectedCategory?.name}</span>? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="mt-4"><Button type="button" variant="outline" onClick={() => setIsCategoryDeleteOpen(false)}>Cancel</Button><Button type="button" variant="destructive" onClick={handleCategoryDelete} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete Category"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MEDIA PICKER */}
      <MediaPicker 
        open={isMediaPickerOpen} 
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleMediaSelect}
        allowedTypes={mediaPickerTarget ? [mediaPickerTarget.type] : ["image", "video"]}
      />
      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <SermonsListMobilePreview sermons={sermons} seriesList={categoryList} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
