"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SermonRedirectPage() {
  const params = useParams();
  const id = params.id as string;
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    // Basic redirect logic to open app via custom URL scheme or fallback to stores
    const customScheme = `churchapp://sermons/${id}`;
    
    // Replace these with your actual App Store / Play Store links
    const appStoreUrl = "https://apps.apple.com/app/idYOUR_APP_ID";
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.yourchurch.app";

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);

    // Attempt to open the app via custom scheme
    window.location.href = customScheme;

    // Set a timeout to redirect to the store if the app doesn't open
    const timeout = setTimeout(() => {
      setRedirecting(false);
      if (isIOS) {
        window.location.href = appStoreUrl;
      } else if (isAndroid) {
        window.location.href = playStoreUrl;
      } else {
        // Fallback for desktop users
        window.location.href = "/";
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {redirecting ? (
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold mb-2">Opening Sermon...</h1>
          <p className="text-muted-foreground">You will be redirected to the app automatically.</p>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">App Required</h1>
          <p className="text-muted-foreground mb-6">
            To listen to this sermon, please download our official church app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://apps.apple.com/app/idYOUR_APP_ID"
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              App Store
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.yourchurch.app"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Play Store
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
