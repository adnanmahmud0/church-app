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
  series?: { _id: string; name: string };
  date: string;
  duration_seconds?: number;
  audio_url?: string;
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

          {sermon.audio_url ? (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <FileAudioIcon className="mr-2 h-5 w-5 text-primary" /> Audio Playback
              </h3>
              <audio 
                controls 
                className="w-full" 
                src={`${BACKEND_URL}${sermon.audio_url}`} 
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="bg-muted border rounded-lg p-6 text-center text-muted-foreground">
              No Audio Uploaded
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
                <span className="text-sm text-muted-foreground flex items-center"><BookOpenIcon className="mr-2 h-4 w-4" /> Series</span>
                <span className="font-medium text-base">
                  {sermon.series ? sermon.series.name : "Standalone"}
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

// Ensure icon is available for fallback, otherwise remove it or import it.
function FileAudioIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 20v-1a2 2 0 1 1 4 0v1a1.5 1.5 0 1 1-3 0 1.5 1.5 0 1 1-3 0 1.5 1.5 0 1 1-3 0 1.5 1.5 0 1 1-3 0" />
      <path d="M6 20v-1a2 2 0 1 0-4 0v1a1.5 1.5 0 1 0 3 0" />
      <line x1="2" x2="10" y1="20" y2="20" />
    </svg>
  );
}
