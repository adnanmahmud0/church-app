import React, { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

interface EventsMobilePreviewProps {
  events: any[];
  categories: any[];
  stats: any;
}

export function EventsMobilePreview({ events, categories, stats }: EventsMobilePreviewProps) {
  const [view, setView] = useState<'upcoming' | 'history' | 'details'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter events based on view and category
  const filteredEvents = events.filter((event) => {
    // Basic status filter
    const isPast = event.isPast || new Date(event.date) < new Date();
    if (view === 'upcoming' && isPast) return false;
    // History now means RSVP'd events (My Events), regardless of date
    if (view === 'history' && !event.hasRsvp) return false;

    // Category filter
    if (activeCategory !== 'all') {
      if (event.categoryLabel?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const getEventColor = (colorString: string) => {
    if (!colorString) return '#3b5bdb';
    return colorString;
  };

  if (view === 'details' && selectedEvent) {
    const color = getEventColor(selectedEvent.categoryColor);
    return (
      <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-12 pb-6">
          <button onClick={() => setView('upcoming')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Event Details</h1>
            <p className="text-sm text-[#FDB100]">PIWC Stoneyburn</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 scrollbar-none">
          {/* Top Banner section */}
          <div className="flex flex-col items-center justify-center py-6 pb-8" style={{ backgroundColor: color }}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <CalendarIcon className="w-10 h-10 text-white" />
            </div>
            <div className="px-4 py-1 rounded-full bg-white/20 text-sm font-bold tracking-wider uppercase">
              {selectedEvent.categoryLabel || "EVENT"}
            </div>
          </div>

          <div className="px-5 py-6">
            <h2 className="text-2xl font-bold mb-6">{selectedEvent.title}</h2>

            <div className="bg-[#1A2B56] rounded-2xl overflow-hidden divide-y divide-white/10 mb-8">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-[#FDB100]" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium tracking-wider mb-1">DATE</p>
                  <p className="font-medium text-[15px]">{selectedEvent.date}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <ClockIcon className="w-5 h-5 text-[#FDB100]" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium tracking-wider mb-1">TIME</p>
                  <p className="font-medium text-[15px]">{selectedEvent.time}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-5 h-5 text-[#FDB100]" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium tracking-wider mb-1">LOCATION</p>
                  <p className="font-medium text-[15px]">{selectedEvent.location}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5 text-[#FDB100]" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium tracking-wider mb-1">ATTENDING</p>
                  <p className="font-medium text-[15px]">{selectedEvent.attendingCount || 0} people</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">About This Event</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
                {selectedEvent.description || "Join us for this special event. All are welcome! Come and be blessed."}
              </p>
            </div>

            <div className="space-y-3">
              {selectedEvent.hasRsvp ? (
                <button disabled className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  You're Attending!
                </button>
              ) : (
                <button className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: '#FDB100', color: '#0A1A44' }}>
                  <CalendarIcon className="w-5 h-5" />
                  RSVP for This Event
                </button>
              )}
              <button className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5" style={{ color: '#FDB100' }}>
                <CalendarIcon className="w-5 h-5" />
                Add to Calendar
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
      <div className="px-6 pt-12 pb-4">
        {view === 'history' ? (
          <div className="flex items-center gap-4">
            <button onClick={() => setView('upcoming')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Events History</h1>
              <p className="text-sm text-[#FDB100]">PIWC Stoneyburn</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Events</h1>
              <p className="text-sm text-[#FDB100] mt-1">PIWC Stoneyburn</p>
            </div>
            <button 
              onClick={() => setView('history')}
              className="bg-[#FDB100] text-[#0A1A44] px-4 py-2 rounded-full font-bold text-sm"
            >
              History
            </button>
          </div>
        )}
      </div>

      {/* Categories Filter */}
      <div className="px-6 pb-6 pt-2 overflow-x-auto scrollbar-none flex gap-2 shrink-0">
        <button 
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-[#2563EB] text-white' : 'bg-[#1A2C5B] text-white/80'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat.label ? 'bg-[#2563EB] text-white' : 'bg-[#1A2C5B] text-white/80'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 scrollbar-none space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-white/40" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">No {view} events</h3>
              <p className="text-white/60 text-sm mt-1">
                There are no {activeCategory !== 'all' ? activeCategory : ''} events to display at the moment.
              </p>
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const color = getEventColor(event.categoryColor);
            
            return (
              <div 
                key={event.id}
                className="bg-[#1A2B56] rounded-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedEvent(event);
                  setView('details');
                }}
              >
                {/* Card Header Band */}
                <div 
                  className="px-4 py-3 flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase"
                  style={{ backgroundColor: color }}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {event.categoryLabel || "EVENT"}
                </div>
                
                {/* Card Body */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-4">{event.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-zinc-300 text-sm">
                      <ClockIcon className="w-4 h-4 text-zinc-400" />
                      {event.date} &middot; {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 text-sm">
                      <MapPinIcon className="w-4 h-4 text-zinc-400" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    {event.hasRsvp ? (
                      <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {view === 'upcoming' ? 'You are attending' : 'You attended'}
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-full bg-[#2563EB]/20 text-[#60A5FA] text-xs font-semibold">
                        {event.attendingCount || 0} {view === 'upcoming' ? 'attending' : 'attended'}
                      </div>
                    )}
                    <button 
                      className="px-5 py-2 rounded-full font-bold text-sm shadow-sm"
                      style={{ 
                        backgroundColor: color, 
                        color: ['#fbbf24', '#fcd34d', '#facc15', '#eab308'].includes(color) ? '#0A1A44' : 'white' 
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      {view !== 'details' && (
        <div className="absolute bottom-0 w-full h-20 bg-[#0A1A44] border-t border-white/10 flex items-center justify-around px-2 z-10">
          {[
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Home' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m9 8 6 4-6 4Z"/></svg>, label: 'Sermons' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, label: 'Give' },
            { icon: <CalendarIcon className="w-6 h-6" />, label: 'Events', active: true },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>, label: 'More' },
          ].map((item, i) => (
            <div key={i} className={`flex flex-col items-center justify-center w-14 gap-1 ${item.active ? 'text-[#FDB100]' : 'text-zinc-400'}`}>
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
