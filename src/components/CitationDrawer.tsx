import React from 'react';
import { Copy, Bookmark, Share2, BookOpen } from 'lucide-react';

export const CitationDrawer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container/80 backdrop-blur-lg border-t border-primary/10 px-8 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <BookOpen className="text-primary" size={18} />
        <div className="flex flex-col">
          <span className="font-label text-[10px] uppercase font-bold text-primary leading-none">Reference Archive</span>
          <span className="font-body text-xs italic text-on-surface-variant">Cite this page: Thorne, J. et al. (2024) Project Methodology.</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-primary hover:underline font-label text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Copy size={14} />
          Copy Citation
        </button>
        <button className="bg-primary text-on-primary h-8 w-8 flex items-center justify-center rounded-sm hover:bg-primary-container transition-colors">
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
};
