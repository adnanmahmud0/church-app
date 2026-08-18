import React from "react";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
          Account Deletion Request for COP UK- PIWC Stoneyburn
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-p:min-h-[1.5rem] whitespace-pre-wrap">
          <p>
            If you wish to delete your account and associated data from the <strong>COP UK- PIWC Stoneyburn</strong> app, you can:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Delete directly from the mobile app via <strong>More &gt; My Profile &gt; Delete Account</strong>.</li>
            <li>Or request account deletion by emailing us at <a href="mailto:info@piwcstoneyburn.org" className="text-blue-600 dark:text-blue-400 hover:underline">info@piwcstoneyburn.org</a> with your registered email address.</li>
          </ul>
          <p>
            Upon receiving your request, all your personal data (name, email, profile info) will be permanently deleted within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
