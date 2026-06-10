import React from 'react';
import { ArrowLeftIcon, BookmarkIcon, ShareIcon, PlayCircleIcon } from 'lucide-react';

interface SermonPreviewProps {
  data: {
    title: string;
    speaker: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    tags: string;
  }
}

export function SermonMobilePreview({ data }: SermonPreviewProps) {
  const tagsList = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  // Use a placeholder backend URL prefix if it's a relative path, otherwise use as is
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <>
    <style>{`
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div className="w-[320px] h-[650px] bg-[#0A1128] text-white rounded-[2rem] overflow-hidden border-[10px] border-black shadow-2xl flex flex-col shrink-0 relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-[#111A3A]">
        <div className="flex items-center gap-3">
          <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Sermon</h1>
            <p className="text-xs text-yellow-500 font-medium">PIWC Stoneyburn</p>
          </div>
        </div>
        <BookmarkIcon className="w-5 h-5 text-gray-300" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 hide-scroll">
        {/* Video / Thumbnail Area */}
        <div className="w-full aspect-video bg-gray-800 relative flex items-center justify-center border-b border-gray-700">
          {data.thumbnail_url || data.video_url ? (
            <>
               {data.thumbnail_url && (
                 <img src={getImageUrl(data.thumbnail_url)} alt="Thumbnail" className="w-full h-full object-cover absolute inset-0 opacity-80" />
               )}
               <PlayCircleIcon className="w-16 h-16 text-red-600 relative z-10 bg-white rounded-full p-1" />
            </>
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <PlayCircleIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-medium">No Media Preview</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-[22px] font-bold leading-tight mb-1 text-white">
              {data.title || "Sermon Title"}
            </h2>
            <p className="text-[#5a7dd9] font-medium text-[15px]">
              {data.speaker || "Speaker Name"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[17px] text-white">About This Message</h3>
            <p className="text-gray-300 text-[14px] leading-relaxed whitespace-pre-wrap">
              {data.description || "In uncertain times, our hope is not wishful thinking but a firm anchor rooted in God's promises. This message explores Hebrews 6 and what it means to hold fast to hope."}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {tagsList.length > 0 ? (
              tagsList.map((tag, idx) => (
                <span key={idx} className="bg-[#1A2650] text-[#7a9cf5] text-xs px-3.5 py-1.5 rounded-full font-medium">
                  #{tag.replace(/^#/, '')}
                </span>
              ))
            ) : (
              <div className="flex flex-wrap gap-2 opacity-50">
                 <span className="bg-[#1A2650] text-[#7a9cf5] text-xs px-3.5 py-1.5 rounded-full font-medium">#hope</span>
                 <span className="bg-[#1A2650] text-[#7a9cf5] text-xs px-3.5 py-1.5 rounded-full font-medium">#faith</span>
                 <span className="bg-[#1A2650] text-[#7a9cf5] text-xs px-3.5 py-1.5 rounded-full font-medium">#promises</span>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button className="w-full py-3.5 mt-2 border border-[#2a3b70] rounded-xl flex items-center justify-center gap-2 text-[#7a9cf5] font-semibold hover:bg-[#1A2650] transition-colors">
            <ShareIcon className="w-4 h-4" />
            Share This Sermon
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
