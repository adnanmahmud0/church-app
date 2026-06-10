import React, { useState } from 'react';
import { ArrowLeftIcon, VideoIcon, CheckCircle2Icon, PlayIcon, BellIcon, ChevronRightIcon } from 'lucide-react';

export function WatchLiveMobilePreview() {
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'facebook'>('youtube');

  const recentServices = [
    {
      title: "Sunday Service — 4 May 2026",
      speaker: "Pastor Emmanuel Asante",
      time: "2h 15min · 4 May 2026",
      color: "bg-blue-600"
    },
    {
      title: "Sunday Service — 27 Apr 2026",
      speaker: "Elder Grace Mensah",
      time: "2h 08min · 27 Apr 2026",
      color: "bg-red-600"
    },
    {
      title: "Prayer Night — 25 Apr 2026",
      speaker: "PIWC Stoneyburn",
      time: "1h 45min · 25 Apr 2026",
      color: "bg-purple-600"
    },
    {
      title: "Sunday Service — 20 Apr 2026",
      speaker: "Deacon David Boateng",
      time: "2h 02min · 20 Apr 2026",
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Watch Live</h1>
            <p className="text-sm font-medium text-[#FDB100]">PIWC Stoneyburn</p>
          </div>
        </div>
        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-none px-5">
        {/* Live Now Banner */}
        <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg mb-8 h-[220px]">
          <VideoIcon className="w-12 h-12 text-white mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold text-white mb-2">We're Live Now!</h2>
          <p className="font-semibold text-white">Sunday Worship Service</p>
          <p className="text-white/80 text-sm mt-1">PIWC Stoneyburn</p>
        </div>

        {/* Watch on Section */}
        <h3 className="font-bold text-lg mb-4">Watch on</h3>
        <div className="space-y-3 mb-6">
          {/* YouTube */}
          <div 
            onClick={() => setSelectedPlatform('youtube')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors ${
              selectedPlatform === 'youtube' ? 'border-red-500 bg-[#1A2C5B]' : 'border-white/10 bg-[#1A2C5B] opacity-80'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-2.5 rounded-xl shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight">YouTube Live</h4>
                <p className="text-xs text-zinc-400 mt-1">Opens YouTube in browser</p>
              </div>
            </div>
            {selectedPlatform === 'youtube' && (
              <CheckCircle2Icon className="w-6 h-6 text-red-500 shrink-0" fill="currentColor" />
            )}
          </div>

          {/* Facebook */}
          <div 
            onClick={() => setSelectedPlatform('facebook')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors ${
              selectedPlatform === 'facebook' ? 'border-blue-500 bg-[#1A2C5B]' : 'border-white/10 bg-[#1A2C5B] opacity-80'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-xl shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight">Facebook Live</h4>
                <p className="text-xs text-zinc-400 mt-1">Opens Facebook in browser</p>
              </div>
            </div>
            {selectedPlatform === 'facebook' && (
              <CheckCircle2Icon className="w-6 h-6 text-blue-500 shrink-0" fill="currentColor" />
            )}
          </div>
        </div>

        {/* Watch Button */}
        <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mb-2">
          <VideoIcon className="w-5 h-5" fill="currentColor" />
          Watch Live on {selectedPlatform === 'youtube' ? 'YouTube Live' : 'Facebook Live'}
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-zinc-400 mb-8">
          Opens in your browser · {selectedPlatform === 'youtube' ? 'YouTube Live' : 'Facebook Live'}
        </p>

        {/* Recent Services */}
        <h3 className="font-bold text-lg mb-4">Recent Services</h3>
        <div className="space-y-3 pb-8">
          {recentServices.map((service, index) => (
            <div key={index} className="bg-[#1A2C5B] rounded-2xl p-4 flex items-center gap-4 cursor-pointer">
              <div className={`w-14 h-14 ${service.color} rounded-xl shrink-0 flex items-center justify-center`}>
                <PlayIcon className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm leading-tight mb-1">{service.title}</h4>
                <p className="text-xs text-zinc-400">{service.speaker}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500">
                  <PlayIcon className="w-3 h-3" />
                  {service.time}
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-zinc-400 shrink-0" />
            </div>
          ))}
        </div>

        {/* Floating Notification Card (Now scrollable) */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between shadow-xl mt-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <BellIcon className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Never miss a service</h4>
              <p className="text-[10px] text-white/80 leading-tight">Subscribe to our YouTube<br/>channel for live notifications</p>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
