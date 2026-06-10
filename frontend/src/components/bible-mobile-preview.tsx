import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, SearchIcon, ChevronDownIcon, Loader2Icon } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function BibleMobilePreview() {
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  const [versions, setVersions] = useState<any[]>([]);
  const [activeVersion, setActiveVersion] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiFetch('/bible/versions').then(res => {
      if (res?.success) {
        const activeVersions = res.data.filter((v: any) => v.isActive);
        setVersions(activeVersions);
        if (activeVersions.length > 0) setActiveVersion(activeVersions[0]);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeVersion) {
      setLoading(true);
      apiFetch(`/bible/books?version=${activeVersion.id}`).then(res => {
        if (res?.success) setBooks(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [activeVersion]);

  const loadChapters = (book: any) => {
    setSelectedBook(book);
    setView('chapters');
    setLoading(true);
    apiFetch(`/bible/books/${book.id}/chapters?version=${activeVersion?.id}`).then(res => {
      if (res?.success) setChapters(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadVerses = (chapterNum: string) => {
    setSelectedChapter(chapterNum);
    setView('verses');
    setLoading(true);
    apiFetch(`/bible/books/${selectedBook.id}/chapters/${chapterNum}?version=${activeVersion?.id}`).then(res => {
      if (res?.success) {
        setVerses(res.data.verses || res.data || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const filteredBooks = books.filter(b => {
    const bookName = b.name || b.id || '';
    return bookName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 relative z-10 bg-[#0A1A44]">
        <button 
          onClick={() => {
            if (view === 'verses') setView('chapters');
            else if (view === 'chapters') setView('books');
          }} 
          className={`p-1 hover:bg-white/10 rounded-full transition-colors ${view === 'books' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold truncate px-2">
          {view === 'books' ? 'Bible' : view === 'chapters' ? (selectedBook?.name || selectedBook?.id) : `${selectedBook?.name || selectedBook?.id} ${selectedChapter}`}
        </h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 scrollbar-none relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A1A44]/50 z-20">
            <Loader2Icon className="w-8 h-8 animate-spin text-[#4B7BFF]" />
          </div>
        )}

        {view === 'books' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A2C5B] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#4B7BFF]"
              />
            </div>

            <div className="relative z-30">
              <div 
                className="bg-[#1A2C5B] border border-white/10 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-semibold text-sm">{activeVersion?.name || 'Select Version'}</span>
                <ChevronDownIcon className="w-5 h-5 text-zinc-400" />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2C5B] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-none">
                  {versions.map(v => (
                    <div 
                      key={v.id} 
                      className={`px-4 py-3 cursor-pointer hover:bg-[#2A3C6B] text-sm ${activeVersion?.id === v.id ? 'bg-[#2A3C6B] font-bold' : ''}`}
                      onClick={() => {
                        setActiveVersion(v);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {v.name} ({v.abbreviation})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => loadChapters(book)}
                  className="bg-[#1A2C5B] rounded-2xl p-4 flex flex-col justify-center min-h-[80px] cursor-pointer hover:bg-[#2A3C6B] transition-colors"
                >
                  <h3 className="font-bold text-base mb-1 truncate">{book.name || book.abbreviation || book.id}</h3>
                  <p className="text-xs text-zinc-400">{book.chapters_count || 0} ch.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'chapters' && selectedBook && (
          <div className="p-5">
            <h2 className="text-2xl font-bold mb-1">{selectedBook.name || selectedBook.id}</h2>
            <p className="text-sm text-zinc-400 mb-6">{selectedBook.chapters_count || chapters.length} chapters</p>
            
            <div className="grid grid-cols-4 gap-3">
              {chapters.map((ch) => (
                <div
                  key={ch.chapter_number || ch}
                  onClick={() => loadVerses(ch.chapter_number || ch)}
                  className="aspect-square bg-[#1A2C5B] text-white hover:bg-[#2A3C6B] rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
                >
                  {ch.chapter_number || ch}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'verses' && selectedBook && selectedChapter && (
          <div className="p-5 pb-24">
            <h2 className="text-3xl font-bold mb-8">{selectedBook.name || selectedBook.id} {selectedChapter}</h2>
            
            <div className="space-y-6">
              {verses.map((verse: any, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-[#4B7BFF] font-bold shrink-0">{verse.verse_number || verse.verse}</span>
                  <p className="text-white text-lg leading-relaxed">{verse.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
