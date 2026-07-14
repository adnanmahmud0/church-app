"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageSkeleton } from "@/components/page-skeleton"

interface IChurchInfo {
  sunday_service_start_time?: string;
  sunday_service_end_time?: string;
  sunday_service_reminder_enabled?: boolean;
  sunday_service_reminders?: { minutes: number; title: string; message: string }[];
  sunday_service_start_notification_enabled?: boolean;
  sunday_service_start_title?: string;
  sunday_service_start_message?: string;
}

export default function SundayServicePage() {
  const [data, setData] = useState<IChurchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminders, setReminders] = useState<{minutes: number, title: string, message: string}[]>([]);
  const [newReminderMinute, setNewReminderMinute] = useState("");
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderMessage, setNewReminderMessage] = useState("");
  const [startNotificationEnabled, setStartNotificationEnabled] = useState(false);
  const [startTitle, setStartTitle] = useState("");
  const [startMessage, setStartMessage] = useState("");

  const handleAddReminder = () => {
    const val = Number(newReminderMinute);
    if (val > 0 && !reminders.find(r => r.minutes === val)) {
      setReminders([...reminders, { minutes: val, title: newReminderTitle, message: newReminderMessage }].sort((a, b) => b.minutes - a.minutes));
      setIsDirty(true);
    }
    setNewReminderMinute("");
    setNewReminderTitle("");
    setNewReminderMessage("");
  };

  const handleRemoveReminder = (val: number) => {
    setReminders(reminders.filter((m) => m.minutes !== val));
    setIsDirty(true);
  };

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
        setStartTime(info.sunday_service_start_time || "");
        setEndTime(info.sunday_service_end_time || "");
        setReminderEnabled(info.sunday_service_reminder_enabled || false);
        setReminders(info.sunday_service_reminders || []);
        setStartNotificationEnabled(info.sunday_service_start_notification_enabled || false);
        setStartTitle(info.sunday_service_start_title || "");
        setStartMessage(info.sunday_service_start_message || "");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load service settings");
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
          sunday_service_start_time: startTime,
          sunday_service_end_time: endTime,
          sunday_service_reminder_enabled: reminderEnabled,
          sunday_service_reminders: reminders,
          sunday_service_start_notification_enabled: startNotificationEnabled,
          sunday_service_start_title: startTitle,
          sunday_service_start_message: startMessage
        })
      });
      
      if (res.success) {
        toast.success("Sunday service settings updated");
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
    return <PageSkeleton />
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Sunday Service Time</h1>
        <p className="text-zinc-500 mt-2">Manage service hours and automated push notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Service Schedule Settings */}
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Service Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Time</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => { setStartTime(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Time</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => { setEndTime(e.target.value); setIsDirty(true); }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>
          </div>
        </section>

        {/* Reminder Notification */}
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Reminder Notification Before Service</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-base font-medium text-zinc-900 dark:text-white block">Enable Reminder Notification</label>
              <span className="text-sm text-zinc-500">Send a push notification before the service starts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={reminderEnabled}
                onChange={(e) => { setReminderEnabled(e.target.checked); setIsDirty(true); }}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-white"></div>
            </label>
          </div>

          {reminderEnabled && (
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Active Reminders</h3>
              
              <div className="flex flex-col gap-3 mb-6">
                {reminders.map((reminder) => (
                  <div key={reminder.minutes} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <span className="inline-block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 rounded text-xs font-bold mb-2 md:mb-0 md:mr-3">
                        {reminder.minutes} mins before
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white block">
                        {reminder.title || "Sunday Service Reminder"}
                      </span>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {reminder.message || "Sunday service will start soon. See you soon!"}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveReminder(reminder.minutes)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div className="text-sm text-zinc-500 italic p-3 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
                    No reminders configured yet. Add one below.
                  </div>
                )}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-md border border-zinc-200 dark:border-zinc-700 space-y-4">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Add New Reminder</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Minutes Before Service</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newReminderMinute}
                    onChange={(e) => setNewReminderMinute(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full md:w-1/3 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Notification Title</label>
                  <input 
                    type="text" 
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    placeholder="e.g. Sunday Service Reminder"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Notification Message</label>
                  <textarea 
                    value={newReminderMessage}
                    onChange={(e) => setNewReminderMessage(e.target.value)}
                    placeholder="Wake up! Service starts in 60 minutes."
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[80px]"
                  />
                  <p className="text-xs text-zinc-500">Leave blank to use default message.</p>
                </div>

                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={handleAddReminder}
                    disabled={!newReminderMinute || Number(newReminderMinute) <= 0}
                    className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                  >
                    Add Reminder
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Start Notification */}
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Service Start Notification</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-base font-medium text-zinc-900 dark:text-white block">Enable Start-Time Notification</label>
              <span className="text-sm text-zinc-500">Send a push notification exactly when the service starts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={startNotificationEnabled}
                onChange={(e) => { setStartNotificationEnabled(e.target.checked); setIsDirty(true); }}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-white"></div>
            </label>
          </div>

          {startNotificationEnabled && (
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Start Title</label>
                <input 
                  type="text"
                  value={startTitle}
                  onChange={(e) => { setStartTitle(e.target.value); setIsDirty(true); }}
                  placeholder="Sunday Service Starting"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Start Message</label>
                <textarea 
                  value={startMessage}
                  onChange={(e) => { setStartMessage(e.target.value); setIsDirty(true); }}
                  placeholder="Our Sunday service is starting now. Join us!"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[80px]"
                />
                <p className="text-xs text-zinc-500">Leave blank to use the default title and message.</p>
              </div>
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
