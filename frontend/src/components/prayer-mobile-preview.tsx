import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, HandHeartIcon, CheckIcon, HeartHandshakeIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PrayerMobilePreviewProps {
  requests: any[];
}

export function PrayerMobilePreview({ requests }: PrayerMobilePreviewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [name, setName] = useState("Anonymous");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState("");

  const displayedRequests = activeTab === "all" ? requests : [];

  return (
    <>
    <style>{`
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      
      .prayer-modal-overlay {
        animation: fadeIn 0.2s ease-out;
      }
      .prayer-modal-content {
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `}</style>
    <div className="w-[360px] h-[740px] bg-[#0A1128] text-white rounded-[2rem] overflow-hidden border-[10px] border-black shadow-2xl flex flex-col shrink-0 relative font-sans">
      
      {/* Top Header */}
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#0A1128] pt-12 pb-4 px-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-[26px] font-bold leading-none mb-1 tracking-tight">Prayer Wall</h1>
            <p className="text-[12px] text-yellow-500 font-medium">PIWC Stoneyburn</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#fbbf24] text-[#854d0e] px-4 py-2 rounded-full flex items-center gap-1.5 font-bold text-sm shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 py-4">
        <div className="flex bg-[#1A2859] rounded-xl p-1 border border-[#2a3b70]/30 shadow-inner">
          <button 
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-gray-400'}`}
          >
            Prayer Wall
          </button>
          <button 
            onClick={() => setActiveTab("mine")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'mine' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-gray-400'}`}
          >
            My Requests
          </button>
        </div>
      </div>

      {/* List / Empty State */}
      <div className="flex-1 overflow-y-auto hide-scroll px-5 pb-6 flex flex-col gap-4">
        {displayedRequests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
            <HeartHandshakeIcon className="w-20 h-20 text-white/20 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No requests yet</h2>
            <p className="text-gray-400 text-sm">Be the first to share a prayer request</p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const authorName = req.is_anonymous ? 'Anonymous' : (req.author_name || 'Anonymous');
            const initial = authorName.charAt(0).toUpperCase();
            const dateStr = req.createdAt ? format(new Date(req.createdAt), 'MMM d, yyyy') : 'Unknown date';
            
            return (
              <div key={req._id || Math.random()} className="bg-[#1A2859] rounded-[1.2rem] p-5 shadow-sm border border-[#2a3b70]/30 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-white">{authorName}</h3>
                    <p className="text-[12px] text-gray-400">{dateStr}</p>
                  </div>
                </div>
                
                <p className="text-white/90 text-[15px] leading-relaxed mt-1">
                  {req.content}
                </p>

                <div className="mt-2">
                  <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold w-fit shadow-sm transition-colors">
                    <HeartHandshakeIcon className="w-4 h-4 fill-white text-white" />
                    I Prayed · {req.pray_count || 0}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end prayer-modal-overlay">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          
          {/* Modal Content */}
          <div className="bg-[#0A1128] rounded-t-[2rem] border-t border-[#2a3b70]/50 relative z-10 p-5 pb-8 prayer-modal-content">
            <div className="flex justify-between items-center mb-6 pt-2">
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 font-medium px-2">Cancel</button>
              <h2 className="text-[19px] font-bold">Share a Request</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#3B82F6] font-bold px-2">Submit</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1A2859] rounded-xl px-4 py-3.5 text-[15px] text-white border border-[#2a3b70]/50 outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[15px] font-bold">Prayer as Anonymous</label>
                <div 
                  className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${isAnonymous ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-gray-500'}`}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  {isAnonymous && <CheckIcon className="w-4 h-4 text-white" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Prayer Request</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share what's on your heart..."
                  className="w-full h-32 bg-[#1A2859] rounded-xl px-4 py-3.5 text-[15px] text-white border border-[#2a3b70]/50 outline-none focus:border-[#3B82F6] transition-colors resize-none"
                />
              </div>

              <p className="text-[13px] text-gray-400 leading-relaxed pt-2">
                Your request will be shared with the church family. You can choose to remain anonymous.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
