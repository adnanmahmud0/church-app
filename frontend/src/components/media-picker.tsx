"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ImageIcon, FileAudioIcon, FileVideoIcon, UploadIcon } from "lucide-react";

type MediaItem = {
  _id: string;
  url: string;
  type: string;
  filename: string;
};

const BACKEND_URL = "http://localhost:5000";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  allowedTypes?: ("image" | "audio" | "video")[];
}

export function MediaPicker({ open, onOpenChange, onSelect, allowedTypes = ["image", "video", "audio"] }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>(allowedTypes[0] || "image");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && allowedTypes.length > 0) {
      if (!allowedTypes.includes(activeTab as any)) {
        setActiveTab(allowedTypes[0]);
      }
    }
  }, [open, allowedTypes, activeTab]);

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
    if (open) {
      fetchMedia(activeTab);
    }
  }, [open, activeTab]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", activeTab);

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
        headers: {}, 
      });
      toast.success("File uploaded successfully");
      
      // Auto-select the newly uploaded file if the response contains the URL
      if (res.data && res.data.url) {
        onSelect(res.data.url);
        onOpenChange(false);
      } else {
        // Otherwise just refresh the list
        fetchMedia(activeTab);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Select Media</DialogTitle>
          <div className="flex items-center gap-2 pr-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept={activeTab === 'image' ? 'image/*' : activeTab === 'video' ? 'video/*' : 'audio/*'} 
              onChange={handleFileChange} 
            />
            <Button size="sm" onClick={handleUploadClick} disabled={isUploading}>
              <UploadIcon className="mr-2 h-4 w-4" /> {isUploading ? "Uploading..." : `Upload ${activeTab}`}
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            {allowedTypes.includes("image") && <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/> Images</TabsTrigger>}
            {allowedTypes.includes("video") && <TabsTrigger value="video"><FileVideoIcon className="mr-2 h-4 w-4"/> Videos</TabsTrigger>}
            {allowedTypes.includes("audio") && <TabsTrigger value="audio"><FileAudioIcon className="mr-2 h-4 w-4"/> Audio</TabsTrigger>}
          </TabsList>

          {allowedTypes.map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {media.length === 0 ? (
                <div className="flex flex-col h-48 items-center justify-center rounded-md border border-dashed text-muted-foreground gap-4">
                  <span>No {tab}s found.</span>
                  <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>Upload One Now</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div 
                      key={item._id} 
                      className="group relative rounded-md border overflow-hidden bg-muted/50 aspect-square flex items-center justify-center cursor-pointer hover:border-primary transition-all"
                      onClick={() => {
                        onSelect(item.url);
                        onOpenChange(false);
                      }}
                    >
                      {item.type === "image" ? (
                        <img src={`${BACKEND_URL}${item.url}`} alt={item.filename} className="object-cover w-full h-full" />
                      ) : item.type === "video" ? (
                        <video src={`${BACKEND_URL}${item.url}`} className="object-contain w-full h-full bg-black" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-muted/30 p-2">
                          <FileAudioIcon className="h-8 w-8 mb-2" />
                          <span className="text-xs truncate w-full px-2 text-center" title={item.filename}>{item.filename}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">Select</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
