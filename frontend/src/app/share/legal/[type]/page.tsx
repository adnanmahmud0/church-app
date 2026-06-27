"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function PublicLegalPage() {
  const params = useParams();
  const type = params.type as string;
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const titleMap: Record<string, string> = {
    "terms-and-conditions": "Terms and Conditions",
    "privacy-policy": "Privacy Policy",
    "cookie-policy": "Cookie Policy",
    "disclaimer": "Disclaimer",
    "refund-and-returns-policy": "Refund and Returns Policy"
  };

  const pageTitle = titleMap[type] || "Legal Document";

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await apiFetch(`/legal/${type}`);
        if (res.success && res.data) {
          setContent(res.data.content);
        } else {
          setError("Document not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };
    
    if (type) {
      fetchDocument();
    }
  }, [type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Not Found</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
          {pageTitle}
        </h1>
        
        {/* Render content. If it contains HTML from a rich text editor in the future, dangerouslySetInnerHTML is used. For now, it will safely render text if there are no tags, or HTML if there are tags. */}
        <div 
          className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-p:min-h-[1.5rem] whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content.replace(/&nbsp;|\u00A0/g, ' ') }}
        />
      </div>
    </div>
  );
}
