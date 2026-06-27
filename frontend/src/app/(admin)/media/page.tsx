"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CopyIcon, TrashIcon, UploadIcon, FileAudioIcon, FileVideoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

type MediaItem = {
  _id: string;
  url: string;
  type: string;
  filename: string;
};

// Assuming backend runs on localhost:5000 for now. 
// In a real app, this should come from an environment variable.
const BACKEND_URL = "http://localhost:5000";

const getMediaUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("image");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async (type: string) => {
    try {
      const res = await apiFetch(`/media?type=${type}`);
      if (res.data) {
        setMedia(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load media");
    }
  };

  useEffect(() => {
    fetchMedia(activeTab);
  }, [activeTab]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append("type", activeTab);

    try {
      await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
        headers: {}, // Do not set Content-Type for FormData
      });
      toast.success("File uploaded successfully");
      setIsUploadOpen(false);
      fetchMedia(activeTab);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;
    try {
      await apiFetch(`/media/${id}`, { method: "DELETE" });
      toast.success("Media deleted successfully");
      fetchMedia(activeTab);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete media");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(getMediaUrl(url));
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Media Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadOpen(true)}>
            <UploadIcon className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="image">Images</TabsTrigger>
        </TabsList>

        {["image"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {media.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                No {tab}s found. Upload one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item) => (
                  <div key={item._id} className="group relative rounded-md border overflow-hidden bg-muted/50 aspect-square flex items-center justify-center">
                    {item.type === "image" && (
                      <img src={getMediaUrl(item.url)} alt={item.filename} className="object-cover w-full h-full" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => handleCopyLink(item.url)} title="Copy Link">
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(item._id)} title="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload {activeTab}</DialogTitle>
            <DialogDescription>
              Select a file to upload. It will be categorized as an {activeTab}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md mt-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept={activeTab === 'image' ? 'image/*' : '*'} 
              onChange={handleFileChange} 
            />
            <Button onClick={handleUploadClick} disabled={isLoading}>
              {isLoading ? "Uploading..." : `Choose ${activeTab} File`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
