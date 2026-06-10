"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, SmartphoneIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HistoryMobilePreview } from "@/components/history-mobile-preview";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-zinc-50 border border-zinc-200 rounded-md"><Loader2 className="animate-spin text-zinc-400" /></div>,
});
import "react-quill-new/dist/quill.snow.css";

interface IChurchInfo {
  content: string;
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  sunday_service_time?: string;
  our_mission_quote?: string;
  updated_at: string;
  updated_by: string;
}

export default function HistoryPage() {
  const [data, setData] = useState<IChurchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [content, setContent] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [sundayServiceTime, setSundayServiceTime] = useState("");
  const [ourMissionQuote, setOurMissionQuote] = useState("");

  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

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
        setContent(info.content || "");
        setContactAddress(info.contact_address || "");
        setContactEmail(info.contact_email || "");
        setContactPhone(info.contact_phone || "");
        setContactWebsite(info.contact_website || "");
        setSundayServiceTime(info.sunday_service_time || "");
        setOurMissionQuote(info.our_mission_quote || "");
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
        body: JSON.stringify({ 
          content,
          contact_address: contactAddress,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_website: contactWebsite,
          sunday_service_time: sundayServiceTime,
          our_mission_quote: ourMissionQuote
        })
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">History & Core Values</h1>
          {data && data.updated_at && (
            <p className="text-sm text-zinc-500 mt-2">
              Last updated: {new Date(data.updated_at).toLocaleString()} by <span className="font-medium">{data.updated_by}</span>
            </p>
          )}
        </div>
        <Button variant="outline" size="icon" type="button" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full shrink-0">
          <SmartphoneIcon className="h-5 w-5" />
        </Button>
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

        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Contact & Mission Details (More Page)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Church Address</label>
              <input 
                type="text" 
                value={contactAddress} 
                onChange={(e) => { setContactAddress(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="71 Stoneyburn Street..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sunday Service Time</label>
              <input 
                type="text" 
                value={sundayServiceTime} 
                onChange={(e) => { setSundayServiceTime(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="10:00 AM - 12:30 PM"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
              <input 
                type="email" 
                value={contactEmail} 
                onChange={(e) => { setContactEmail(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="info@piwcstoneyburn.org"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Website URL</label>
              <input 
                type="text" 
                value={contactWebsite} 
                onChange={(e) => { setContactWebsite(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="www.piwcstoneyburn.org"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number (Optional)</label>
              <input 
                type="text" 
                value={contactPhone} 
                onChange={(e) => { setContactPhone(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="+44 123 456 7890"
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Our Mission (Short Quote)</label>
            <textarea 
              value={ourMissionQuote} 
              onChange={(e) => { setOurMissionQuote(e.target.value); setIsDirty(true); }}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[100px]"
              placeholder='"To make heaven, to take as many people as possible with us..."'
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

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <HistoryMobilePreview content={content} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
