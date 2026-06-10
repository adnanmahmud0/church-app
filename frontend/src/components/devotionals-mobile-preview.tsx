import React, { useState } from 'react';
import { ArrowLeftIcon, BookOpenIcon, HeartIcon, Share2Icon, StarIcon, SunIcon, ChevronRightIcon } from 'lucide-react';

interface DevotionalsMobilePreviewProps {
  devotionals: any[];
}

export function DevotionalsMobilePreview({ devotionals }: DevotionalsMobilePreviewProps) {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [selectedDevotional, setSelectedDevotional] = useState<any>(null);

  // Filter out drafts for the mobile view
  const publishedDevotionals = devotionals.filter(d => !d.isDraft);

  const getDayOfWeek = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    } catch {
      return "MONDAY";
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (view === 'details' && selectedDevotional) {
    return (
      <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button onClick={() => setView('list')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Devotional</h1>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <StarIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8 scrollbar-none">
          {/* Top blue band */}
          <div className="bg-[#4B7BFF] px-6 py-6 flex flex-col justify-end min-h-[120px]">
            <p className="text-xs font-bold tracking-wider text-white/80 mb-2 uppercase">
              {getDayOfWeek(selectedDevotional.date)} &middot; {getFormattedDate(selectedDevotional.date)}
            </p>
            <h2 className="text-3xl font-bold leading-tight">{selectedDevotional.title}</h2>
          </div>

          <div className="px-5 py-6">
            {/* Scripture Card */}
            <div className="bg-[#1A2C5B] rounded-xl p-5 border-l-4 border-[#4B7BFF] mb-8">
              <h3 className="text-[#4B7BFF] text-sm font-bold tracking-wider uppercase mb-3">
                {selectedDevotional.scriptureRef || "SCRIPTURE"}
              </h3>
              <p className="text-white italic text-base leading-relaxed">
                "{selectedDevotional.scriptureText || "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures."}"
              </p>
            </div>

            {/* Reflection Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpenIcon className="w-6 h-6 text-[#4B7BFF]" />
                <h3 className="text-xl font-bold">Reflection</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedDevotional.content || 
                  "Jesus does not offer to supplement our lives — He offers to satisfy them. The crowd had just witnessed the miracle of loaves and fish, yet Jesus pointed beyond the physical to a deeper hunger. Every longing we carry — for meaning, for belonging, for peace — finds its answer in Him.\n\nCome to Him today, not just for what He can do, but for who He is."}
              </p>
            </div>

            {/* Prayer Section */}
            <div className="bg-[#1A2C5B] rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6 text-purple-400" fill="currentColor" />
                <h3 className="text-xl font-bold">Prayer</h3>
              </div>
              <p className="text-zinc-400 italic text-sm leading-relaxed whitespace-pre-wrap">
                {selectedDevotional.prayer || 
                  "Jesus, You are the bread of life. I confess that I often look for satisfaction in other places. Fill me today with the only thing that truly satisfies. Amen."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-[#4B7BFF]">
                Mark as Read
              </button>
              <button className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-[#4B7BFF]">
                <Share2Icon className="w-5 h-5" />
                Share This Devotional
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-12 pb-6">
        <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devotionals</h1>
          <p className="text-sm text-[#FDB100] mt-1 font-medium">PIWC Stoneyburn</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-none space-y-4">
        {/* Top Banner */}
        <div className="bg-[#1A2C5B] rounded-xl border border-white/10 p-4 flex items-center gap-4">
          <SunIcon className="w-6 h-6 text-[#FDB100] shrink-0" fill="currentColor" />
          <p className="text-[#4B7BFF] text-sm font-medium leading-snug">
            Read today's devotional and start your day with God
          </p>
        </div>

        {/* List of Devotionals */}
        {publishedDevotionals.length === 0 ? (
          <div className="py-12 text-center text-white/50 text-sm">
            No published devotionals.
          </div>
        ) : (
          publishedDevotionals.map((dev, index) => {
            const isLatest = index === 0;
            return (
              <div 
                key={dev.id}
                onClick={() => {
                  setSelectedDevotional(dev);
                  setView('details');
                }}
                className={`rounded-2xl p-5 flex gap-4 cursor-pointer transition-colors ${
                  isLatest ? 'bg-[#4B7BFF]' : 'bg-[#1A2C5B]'
                }`}
              >
                {/* Left Date Column */}
                <div className="w-20 shrink-0 flex flex-col items-end text-right pt-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isLatest ? 'text-[#FDB100]' : 'text-zinc-400'}`}>
                    {getDayOfWeek(dev.date)}
                  </span>
                  <span className={`text-xs ${isLatest ? 'text-white' : 'text-zinc-300'}`}>
                    {getFormattedDate(dev.date)}
                  </span>
                </div>
                
                {/* Right Content Column */}
                <div className="flex-1 relative">
                  <h3 className="font-bold text-lg leading-tight mb-1">{dev.title}</h3>
                  <p className={`text-sm mb-2 font-medium ${isLatest ? 'text-[#FDB100]' : 'text-[#4B7BFF]'}`}>
                    {dev.scriptureRef || 'Scripture'}
                  </p>
                  <p className={`text-sm line-clamp-2 leading-relaxed ${isLatest ? 'text-white/80' : 'text-zinc-400'}`}>
                    {dev.content?.replace(/<[^>]*>?/gm, '') || 'Start your day reflecting on the word of God and let it guide you...'}
                  </p>
                  <ChevronRightIcon className={`absolute top-0 right-0 w-4 h-4 ${isLatest ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
