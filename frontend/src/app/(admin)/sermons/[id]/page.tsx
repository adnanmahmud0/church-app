"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeftIcon, CalendarIcon, UserIcon, HashIcon, AlignLeftIcon, BookOpenIcon, ClockIcon, VideoIcon } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

type Sermon = {
  _id: string;
  title: string;
  speaker: string;
  category?: { _id?: string; id?: string; name: string };
  series?: { _id: string; name: string };
  date: string;
  duration_seconds?: number;
  video_url?: string;
  thumbnail_url?: string;
  key_scripture?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
};

export default function SermonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSermon(params.id as string);
    }
  }, [params.id]);

  const fetchSermon = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/sermons/${id}`);
      if (res.data) {
        setSermon(res.data);
      } else {
        toast.error("Failed to load sermon details");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Loading Sermon...</h2>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Sermon Not Found</h2>
        </div>
        <Button onClick={() => router.push("/sermons")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Sermons
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/sermons")}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight truncate">{sermon.title}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Left Column: Image and Audio Player */}
        <div className="flex flex-col space-y-6 lg:col-span-1">
          {sermon.thumbnail_url ? (
            <div className="rounded-lg overflow-hidden border aspect-video bg-muted flex items-center justify-center">
              <img 
                src={`${BACKEND_URL}${sermon.thumbnail_url}`} 
                alt={sermon.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="rounded-lg border aspect-video bg-muted flex items-center justify-center text-muted-foreground">
              No Thumbnail Available
            </div>
          )}

          {sermon.video_url && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <VideoIcon className="mr-2 h-5 w-5 text-primary" /> Video Playback
              </h3>
              <video 
                controls 
                className="w-full rounded-md" 
                src={`${BACKEND_URL}${sermon.video_url}`} 
                preload="metadata"
              >
                Your browser does not support the video element.
              </video>
            </div>
          )}

        </div>

        {/* Right Column: Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-xl mb-4 border-b pb-2">Sermon Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><UserIcon className="mr-2 h-4 w-4" /> Speaker</span>
                <span className="font-medium text-base">{sermon.speaker}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Date Preached</span>
                <span className="font-medium text-base">
                  {sermon.date ? new Date(sermon.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><BookOpenIcon className="mr-2 h-4 w-4" /> Category</span>
                <span className="font-medium text-base">
                  {sermon.category ? sermon.category.name : (sermon.series ? sermon.series.name : "None")}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><HashIcon className="mr-2 h-4 w-4" /> Key Scripture</span>
                <span className="font-medium text-base">{sermon.key_scripture || "N/A"}</span>
              </div>
              
              <div className="flex flex-col space-y-1 sm:col-span-2">
                <span className="text-sm text-muted-foreground flex items-center"><AlignLeftIcon className="mr-2 h-4 w-4" /> Description</span>
                <span className="text-base whitespace-pre-wrap">{sermon.description || "No description provided."}</span>
              </div>
              
            </div>
          </div>
          
          {sermon.tags && sermon.tags.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-xl mb-4 border-b pb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {sermon.tags.map((tag, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
