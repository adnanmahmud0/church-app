"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CameraIcon, UploadIcon, CheckIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  avatar: string;
}

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export function ProfileSettingsModal({ open, onOpenChange, user }: ProfileSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);
      const res = await apiFetch("/media?type=image");
      if (res.data) setMedia(res.data);
    } catch (err) {
      toast.error("Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (mediaSelectorOpen) {
      fetchMedia();
    }
  }, [mediaSelectorOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("type", "image");

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: form,
        headers: {},
      });
      if (res.data) {
        setFormData({ ...formData, avatar: res.data.url });
        setMediaSelectorOpen(false);
        toast.success("Image uploaded & selected!");
      }
    } catch (err: any) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isSuperAdmin = user.role?.toUpperCase() === "SUPER_ADMIN";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Handle Profile Update
      if (formData.name !== user.name || formData.email !== user.email || formData.avatar !== user.avatar) {
        const updatePayload: any = {
          name: formData.name,
        };
        if (formData.avatar !== user.avatar) {
          updatePayload.image = formData.avatar;
        }
        if (!isSuperAdmin) updatePayload.email = formData.email;
        
        // We use formData to construct stringified JSON for the 'data' field as per API doc
        const formDataBody = new FormData();
        formDataBody.append("data", JSON.stringify(updatePayload));

        await apiFetch("/user/profile", {
          method: "PATCH",
          headers: {}, // Remove content-type so browser sets multipart boundary
          body: formDataBody,
        });
      }

      // 2. Handle Password Change
      if (formData.newPassword || formData.currentPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        await apiFetch("/auth/change-password", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        });
      }

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-2">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setMediaSelectorOpen(true)}
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar?.startsWith('http') ? formData.avatar : `http://localhost:5000${formData.avatar}`} alt={formData.name} />
                  <AvatarFallback className="text-2xl">{(formData.name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="text-white w-8 h-8" />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSuperAdmin}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password (optional)</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Required if setting a new password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            {formData.newPassword && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Media Selector Dialog */}
      <Dialog open={mediaSelectorOpen} onOpenChange={setMediaSelectorOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Profile Image</DialogTitle>
            <DialogDescription>
              Choose an image from your media gallery or upload a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center py-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleUpload} 
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" size="sm">
              <UploadIcon className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload New Image"}
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 p-2 border rounded-md bg-muted/20">
            {mediaLoading ? (
              <div className="flex items-center justify-center h-32">Loading media...</div>
            ) : media.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No images found. Upload one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {media.map((item) => (
                  <div 
                    key={item._id} 
                    className={`relative cursor-pointer rounded-md overflow-hidden aspect-square border-2 ${formData.avatar === item.url ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => {
                      setFormData({ ...formData, avatar: item.url });
                      setMediaSelectorOpen(false);
                    }}
                  >
                    <img src={`http://localhost:5000${item.url}`} alt="media" className="object-cover w-full h-full" />
                    {formData.avatar === item.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <CheckIcon className="text-white w-8 h-8" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
