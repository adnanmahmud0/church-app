import React from 'react';
import { ArrowLeftIcon, UsersIcon, MessageCircleIcon, GlobeIcon, SendIcon, MessageSquareIcon } from 'lucide-react';

interface CommunityMobilePreviewProps {
  groups: any[];
}

export function CommunityMobilePreview({ groups }: CommunityMobilePreviewProps) {
  // Only show active groups, sorted by sortOrder
  const activeGroups = groups
    .filter(g => g.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
    <style>{`
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div className="w-[360px] h-[740px] bg-[#0A1128] text-white rounded-[2rem] overflow-hidden border-[10px] border-black shadow-2xl flex flex-col shrink-0 relative font-sans">
      
      {/* Top Header */}
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#0A1128] pt-12 pb-4 px-5 flex items-center gap-3 relative z-10">
        <ArrowLeftIcon className="w-6 h-6 text-white" />
        <div>
          <h1 className="text-[26px] font-bold leading-none mb-1 tracking-tight">Community</h1>
          <p className="text-[12px] text-yellow-500 font-medium">PIWC Stoneyburn</p>
        </div>
      </div>

      {/* List / Empty State */}
      <div className="flex-1 overflow-y-auto hide-scroll px-4 pb-6 flex flex-col gap-4 mt-2">
        {activeGroups.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
            <UsersIcon className="w-20 h-20 text-white/20 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No active groups</h2>
            <p className="text-gray-400 text-sm">Community groups will appear here</p>
          </div>
        ) : (
          activeGroups.map((group) => {
            return (
              <div key={group.id} className="bg-[#1A2859] rounded-[1.2rem] p-5 shadow-sm border border-[#2a3b70]/30 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#111A3A] flex items-center justify-center shrink-0">
                    <UsersIcon className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-bold text-[16px] text-white leading-snug">{group.title}</h3>
                </div>
                
                <p className="text-gray-300 text-[14px] leading-relaxed mb-4">
                  {group.description}
                </p>

                <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3.5 rounded-full font-bold text-[15px] transition-colors">
                  Join
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
