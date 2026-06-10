import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';

interface HistoryMobilePreviewProps {
  content?: string;
}

export function HistoryMobilePreview({ content }: HistoryMobilePreviewProps) {
  // If we have real HTML content from the editor, we could render it.
  // But to ensure it matches the provided screenshot's beautiful native layout,
  // we'll display the screenshot's content if there's no real content, 
  // or use a structured approach.
  
  const hasContent = content && content !== '<p><br></p>' && content.length > 20;

  return (
    <div className="w-[320px] h-[650px] bg-[#0A1A44] rounded-[40px] border-[8px] border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col font-sans text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-4 border-b border-white/5">
        <button className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold truncate">History & Core Values</h1>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 scrollbar-none break-words">
        {hasContent ? (
          <div 
            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 break-words [&_*]:break-words [&_*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="space-y-8">
            {/* Our History */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Our History</h2>
              <p className="text-zinc-300 leading-relaxed text-[15px]">
                Founded with a vision to connect people globally, our journey began as a small community initiative. Over the years, we have grown into a platform that empowers individuals through technology and compassion. Our history is a testament to the dedication of our community and the relentless pursuit of our mission.
              </p>
            </section>

            {/* Core Values */}
            <section>
              <h2 className="text-2xl font-bold mb-5">Core Values</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-zinc-300 mb-1">&bull; Integrity</h3>
                  <p className="text-zinc-300 leading-relaxed text-[15px]">
                    We believe in doing the right thing, even when no one is watching.
                  </p>
                </div>
                <div>
                  <h3 className="text-zinc-300 mb-1">&bull; Compassion</h3>
                  <p className="text-zinc-300 leading-relaxed text-[15px]">
                    We care about the well-being of our community and strive to make a positive impact.
                  </p>
                </div>
                <div>
                  <h3 className="text-zinc-300 mb-1">&bull; Innovation</h3>
                  <p className="text-zinc-300 leading-relaxed text-[15px]">
                    We continuously seek new ways to improve and provide the best experience.
                  </p>
                </div>
                <div>
                  <h3 className="text-zinc-300 mb-1">&bull; Excellence</h3>
                  <p className="text-zinc-300 leading-relaxed text-[15px]">
                    We set high standards for ourselves and are committed to achieving them.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Mission */}
            <section className="pb-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-zinc-300 leading-relaxed text-[15px]">
                To foster a supportive and connected environment where everyone can grow, learn, and thrive together.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
