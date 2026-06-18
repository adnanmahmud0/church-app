import React, { useState } from 'react';
import { SearchIcon, HomeIcon, PlayIcon, HeartIcon, CalendarIcon, MoreHorizontalIcon, PlaySquareIcon } from 'lucide-react';
import { Sermon, SermonSeries } from '@/app/(admin)/sermons/page';

interface SermonsListPreviewProps {
  sermons: Sermon[];
  seriesList: SermonSeries[];
}

export function SermonsListMobilePreview({ sermons, seriesList }: SermonsListPreviewProps) {
  const [activeSeries, setActiveSeries] = useState<string>("All");

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredSermons = activeSeries === "All" 
    ? sermons 
    : sermons.filter(sermon => (sermon.category?.name || sermon.series?.name) === activeSeries);

  return (
    <>
    <style>{`
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div className="w-[360px] h-[740px] bg-[#0A1128] text-white rounded-[2rem] overflow-hidden border-[10px] border-black shadow-2xl flex flex-col shrink-0 relative font-sans">
      {/* Top Header - Gradient */}
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#0A1128] pt-12 pb-4 px-6 flex flex-col justify-end">
        <h1 className="text-3xl font-bold mb-1 tracking-tight">Sermons</h1>
        <p className="text-sm text-yellow-500 font-medium">PIWC Stoneyburn</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 hide-scroll flex flex-col bg-[#0A1128]">
        
        {/* Search Bar */}
        <div className="px-5 py-4">
          <div className="bg-[#1A2650] rounded-xl flex items-center px-4 py-3 border border-[#2a3b70]">
            <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search sermons..." 
              className="bg-transparent border-none outline-none text-gray-200 placeholder-gray-400 w-full"
              readOnly
            />
          </div>
        </div>

        {/* Categories / Series Filters */}
        <div className="px-5 pb-4 overflow-x-auto hide-scroll">
          <div className="flex gap-3">
            <button 
              className={`px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${activeSeries === "All" ? "bg-blue-700 text-white" : "bg-transparent border border-[#2a3b70] text-gray-300"}`}
              onClick={() => setActiveSeries("All")}
            >
              All
            </button>
            {seriesList.slice(0, 3).map(series => (
              <button 
                key={series.id}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${activeSeries === series.name ? "bg-blue-700 text-white" : "bg-transparent border border-[#2a3b70] text-gray-300"}`}
                onClick={() => setActiveSeries(series.name)}
              >
                {series.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sermons List */}
        <div className="px-5 space-y-4 flex-1">
          {filteredSermons.slice(0, 5).map(sermon => (
            <div key={sermon.id} className="bg-[#131E44] border border-[#1e2a56] rounded-2xl p-4 flex gap-4 items-center">
              {/* Thumbnail */}
              <div className="w-[84px] h-[84px] rounded-xl overflow-hidden relative shrink-0 bg-gray-800">
                {sermon.thumbnail_url ? (
                  <img src={getImageUrl(sermon.thumbnail_url)} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-900/30"></div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white fill-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                <p className="text-[#3b82f6] text-[10px] font-bold uppercase tracking-wider mb-1 truncate">
                  {sermon.category?.name || sermon.series?.name || "Standalone Message"}
                </p>
                <h3 className="font-bold text-white text-[15px] leading-tight mb-1 truncate">
                  {sermon.title}
                </h3>
                <p className="text-gray-400 text-[12px] truncate mb-2">
                  {sermon.speaker}
                </p>
                <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                  <span>{formatDate(sermon.date)}</span>
                  {sermon.duration_seconds && sermon.duration_seconds > 0 ? (
                    <span className="text-blue-500 font-semibold">{Math.round(sermon.duration_seconds / 60)} min</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 w-full bg-[#03081A] border-t border-[#1a2650] flex justify-between items-center px-6 py-4 pb-6">
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-yellow-500">
          <PlaySquareIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Sermons</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <HeartIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Give</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <CalendarIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Events</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <MoreHorizontalIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </div>
      </div>
    </div>
    </>
  );
}
