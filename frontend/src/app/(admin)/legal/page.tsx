"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-zinc-50 border border-zinc-200 rounded-md"><Loader2 className="animate-spin text-zinc-400" /></div>,
});
import "react-quill-new/dist/quill.snow.css";
const legalTypes = [
  { id: "terms-and-conditions", label: "Terms and Conditions" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "cookie-policy", label: "Cookie Policy" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "refund-and-returns-policy", label: "Refund and Returns Policy" },
];

export default function LegalAdminPage() {
  const [selectedType, setSelectedType] = useState(legalTypes[0].id);
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchLegalDocument(selectedType);
  }, [selectedType]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const fetchLegalDocument = async (type: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/legal/admin/${type}`);
      if (res.success && res.data) {
        setContent(res.data.content || "");
        setIsActive(res.data.isActive ?? true);
        setIsDirty(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load legal document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (value: string, delta: any, source: string) => {
    setContent(value);
    if (source === 'user') {
      setIsDirty(true);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim() || content === "<p><br></p>") {
      return toast.error("Content cannot be empty");
    }

    try {
      setIsSaving(true);
      const res = await apiFetch(`/legal/${selectedType}`, {
        method: "PUT",
        body: JSON.stringify({ 
          type: selectedType,
          content: content,
          isActive: isActive,
        })
      });
      
      if (res.success) {
        toast.success("Legal document updated successfully");
        setIsDirty(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Legal Documents</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Manage terms, privacy policies, and other legal documents.
          </p>
        </div>
        
        <Link 
          href={`/share/legal/${selectedType}`} 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-md text-sm font-medium transition-colors"
        >
          View Public Page <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        {/* Sidebar Selector */}
        <div className="w-full flex flex-wrap gap-2">
          {legalTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) {
                  return;
                }
                setSelectedType(type.id);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {legalTypes.find(t => t.id === selectedType)?.label}
                </h2>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {isActive ? "Active" : "Hidden"}
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => { 
                      setIsActive(!isActive);
                      setIsDirty(true); 
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                      isActive ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                        isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Document Content
                </label>
                <div className="bg-white text-zinc-900 rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-600">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={handleContentChange} 
                    modules={modules}
                    className="h-[400px] mb-12"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Document"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
