import React, { useState } from 'react';
import { HomeIcon, PlaySquareIcon, HeartIcon, CalendarIcon, MoreHorizontalIcon, HistoryIcon, ArrowLeftIcon, DollarSign, Heart, Globe, Star, LandmarkIcon } from 'lucide-react';

interface GivingMobilePreviewProps {
  summary: any;
  funds: any[];
  bankDetails: any;
}

export function GivingMobilePreview({ summary, funds, bankDetails }: GivingMobilePreviewProps) {
  const [view, setView] = useState<"give" | "donate">("give");
  const [selectedFund, setSelectedFund] = useState<string>("Offering");
  const [amount, setAmount] = useState<string>("");

  const presetAmounts = ["£10", "£20", "£50", "£100", "£250"];

  const getFundIcon = (iconName: string, color: string) => {
    const props = { className: "w-5 h-5 mb-2", style: { color } };
    switch (iconName?.toLowerCase()) {
      case "dollar-sign": return <DollarSign {...props} />;
      case "heart": return <Heart {...props} />;
      case "globe": return <Globe {...props} />;
      case "star": return <Star {...props} />;
      default: return <DollarSign {...props} />;
    }
  };

  return (
    <>
    <style>{`
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div className="w-[360px] h-[740px] bg-[#0A1128] text-white rounded-[2rem] overflow-hidden border-[10px] border-black shadow-2xl flex flex-col shrink-0 relative font-sans">
      
      {view === "give" ? (
        <>
          {/* Top Header */}
          <div className="bg-gradient-to-br from-[#1E40AF] to-[#0A1128] pt-12 pb-6 px-6 flex justify-between items-start">
            <div>
              <h1 className="text-[32px] font-bold mb-0.5 tracking-tight">Give</h1>
              <p className="text-[13px] text-yellow-500 font-medium">PIWC Stoneyburn</p>
            </div>
            <button className="bg-[#fbbf24] text-[#854d0e] px-4 py-2 rounded-full flex items-center gap-1.5 font-bold text-sm shadow-sm mt-1">
              <HistoryIcon className="w-4 h-4" />
              History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-28 hide-scroll flex flex-col bg-[#0A1128] px-5 -mt-2">
            
            {/* Total Giving Card */}
            <div className="bg-[#1A2859] rounded-xl p-5 flex justify-between items-center mb-6 shadow-sm border border-[#2a3b70]/50">
              <span className="text-gray-300 text-[15px]">Your giving this year</span>
              <span className="text-yellow-500 font-bold text-[22px]">£{summary?.totalThisYear?.toFixed(2) || "475.00"}</span>
            </div>

            {/* Select Fund */}
            <h2 className="text-[17px] font-bold mb-3">Select Fund</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {funds.length > 0 ? funds.map(fund => {
                const isSelected = selectedFund === fund.name;
                return (
                  <div 
                    key={fund._id}
                    onClick={() => setSelectedFund(fund.name)}
                    className={`rounded-xl p-4 cursor-pointer transition-colors ${isSelected ? 'bg-[#ff4b4b]' : 'bg-[#1A2859]'}`}
                  >
                    {getFundIcon(fund.icon, isSelected ? 'white' : fund.color)}
                    <h3 className={`font-bold text-[15px] mb-1 ${isSelected ? 'text-white' : 'text-white'}`}>{fund.name}</h3>
                    <p className={`text-[12px] leading-snug ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                      {fund.description}
                    </p>
                  </div>
                )
              }) : (
                <div className="col-span-2 text-center text-gray-500 py-4">No funds available</div>
              )}
            </div>

            {/* Amount */}
            <h2 className="text-[17px] font-bold mb-3">Amount (£)</h2>
            <div className="flex justify-between gap-2 mb-4">
              {presetAmounts.map(preset => (
                <button 
                  key={preset}
                  onClick={() => setAmount(preset.replace('£', ''))}
                  className="flex-1 bg-[#1A2859] py-2.5 rounded-lg text-sm font-bold border border-[#2a3b70]/30"
                >
                  {preset}
                </button>
              ))}
            </div>
            
            <div className="bg-[#1A2859] rounded-xl flex items-center px-4 py-3.5 mb-6 border border-[#2a3b70]/30">
              <span className="text-blue-600 font-bold mr-3">£</span>
              <input 
                type="number" 
                placeholder="Enter amount" 
                className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full font-medium"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Donate Button */}
            <button 
              onClick={() => setView("donate")}
              className="w-full bg-[#fbbf24] text-[#854d0e] py-3.5 rounded-xl font-bold text-[17px] flex justify-center items-center gap-2 mb-4"
            >
              Donate <span className="text-xl leading-none -mt-0.5">&rsaquo;</span>
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 w-full bg-[#03081A] border-t border-[#1a2650] flex justify-between items-center px-6 py-4 pb-6">
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <HomeIcon className="w-6 h-6" />
              <span className="text-[10px] font-medium">Home</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <PlaySquareIcon className="w-6 h-6" />
              <span className="text-[10px] font-medium">Sermons</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-yellow-500">
              <HeartIcon className="w-6 h-6 fill-yellow-500" />
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
        </>
      ) : (
        /* Donate Bank Details View */
        <>
          <div className="flex items-center gap-4 pt-12 pb-4 px-5 bg-[#0A1128]">
            <button onClick={() => setView("give")} className="text-white">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-center flex-1 pr-6">Donate</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-2">
            <div className="bg-[#4ade80] rounded-[1.5rem] p-6 text-white shadow-lg">
              <h2 className="text-xl font-bold mb-6">Bank Transfer Details</h2>
              
              <div className="space-y-4 text-[15px]">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Account Name</span>
                  <span className="font-bold">{bankDetails?.accountName || 'PIWC Stoneyburn'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Sort Code</span>
                  <span className="font-bold">{bankDetails?.sortCode || '80-22-60'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Account No.</span>
                  <span className="font-bold">{bankDetails?.accountNumber || '00000000'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Amount</span>
                  <span className="font-bold">£{amount || '50'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Reference</span>
                  <span className="font-bold">{bankDetails?.reference || selectedFund}</span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/20 text-sm leading-relaxed text-white/90">
                {bankDetails?.note || "Please use your full name as the payment reference so we can acknowledge your gift."}
              </div>
            </div>

            <button 
              onClick={() => setView("give")}
              className="w-full bg-white text-[#0A1128] py-4 rounded-xl font-bold text-[16px] mt-8"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </div>
    </>
  );
}
