"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface IChurchInfo {
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  our_mission_quote?: string;
  social_links?: { platform: string; url: string; isEnabled: boolean }[];
  updated_at?: string;
  updated_by?: string;
}

export interface ISocialLink {
  platform: string;
  url: string;
  isEnabled: boolean;
}

export default function ContactMissionPage() {
  const [data, setData] = useState<IChurchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [ourMissionQuote, setOurMissionQuote] = useState("");
  
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);

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
        setContactAddress(info.contact_address || "");
        setContactEmail(info.contact_email || "");
        setContactPhone(info.contact_phone || "");
        setContactWebsite(info.contact_website || "");
        setOurMissionQuote(info.our_mission_quote || "");
        setSocialLinks(info.social_links || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load church info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const res = await apiFetch("/church-info/admin", {
        method: "PUT",
        body: JSON.stringify({ 
          contact_address: contactAddress,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_website: contactWebsite,
          our_mission_quote: ourMissionQuote,
          social_links: socialLinks,
        })
      });
      
      if (res.success) {
        toast.success("Contact & Mission Details updated successfully");
        setIsDirty(false);
        setData(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Contact & Mission Details</h1>
        {data && data.updated_at && (
          <p className="text-sm text-zinc-500 mt-2">
            Last updated: {new Date(data.updated_at).toLocaleString()} by <span className="font-medium">{data.updated_by}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">General Information</h2>
          
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

        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Social Media Links</h2>
            <button
              type="button"
              onClick={() => {
                setSocialLinks([...socialLinks, { platform: "", url: "", isEnabled: true }]);
                setIsDirty(true);
              }}
              className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-md transition-colors"
            >
              + Add Link
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm">
              No social media links added yet. Click "+ Add Link" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-md border border-zinc-200 dark:border-zinc-700">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Platform Name</label>
                    <input 
                      type="text" 
                      value={link.platform} 
                      onChange={(e) => { 
                        const newLinks = [...socialLinks];
                        newLinks[index].platform = e.target.value;
                        setSocialLinks(newLinks);
                        setIsDirty(true); 
                      }}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="e.g. YouTube, Instagram..."
                    />
                  </div>
                  <div className="flex-[2] w-full space-y-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">URL</label>
                    <input 
                      type="text" 
                      value={link.url} 
                      onChange={(e) => { 
                        const newLinks = [...socialLinks];
                        newLinks[index].url = e.target.value;
                        setSocialLinks(newLinks);
                        setIsDirty(true); 
                      }}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6 sm:pt-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {link.isEnabled ? "Active" : "Hidden"}
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={link.isEnabled}
                        onClick={() => { 
                          const newLinks = [...socialLinks];
                          newLinks[index].isEnabled = !newLinks[index].isEnabled;
                          setSocialLinks(newLinks);
                          setIsDirty(true); 
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                          link.isEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                            link.isEnabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = socialLinks.filter((_, i) => i !== index);
                        setSocialLinks(newLinks);
                        setIsDirty(true);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
