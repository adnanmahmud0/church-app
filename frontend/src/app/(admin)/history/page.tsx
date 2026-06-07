"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-zinc-50 border border-zinc-200 rounded-md"><Loader2 className="animate-spin text-zinc-400" /></div>,
});
import "react-quill-new/dist/quill.snow.css";

interface IChurchInfo {
  content: string;
  updated_at: string;
  updated_by: string;
}

export default function HistoryPage() {
  const [data, setData] = useState<IChurchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [content, setContent] = useState("");

  useEffect(() => {
    fetchChurchInfo();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const fetchChurchInfo = async () => {
    try {
      const res = await apiFetch("/church-info/admin");
      if (res.success && res.data) {
        const info = res.data;
        setData(info);
        setContent(info.content);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load church info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || content === "<p><br></p>") {
      return toast.error("Content cannot be empty");
    }

    try {
      setIsSaving(true);
      const res = await apiFetch("/church-info/admin", {
        method: "PUT",
        body: JSON.stringify({ content })
      });
      
      if (res.success) {
        toast.success("Content updated successfully");
        setIsDirty(false);
        setData(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">History & Core Values</h1>
        {data && data.updated_at && (
          <p className="text-sm text-zinc-500 mt-2">
            Last updated: {new Date(data.updated_at).toLocaleString()} by <span className="font-medium">{data.updated_by}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Content Editor</h2>
          <div className="bg-white text-zinc-900 rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-600">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={handleContentChange} 
              modules={modules}
              className="h-[400px] mb-12"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
