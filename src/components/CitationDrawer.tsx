import React from 'react';
import { Copy, Bookmark, BookOpen, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSites } from '../context/SiteContext';

export const CitationDrawer = () => {
  const location = useLocation();
  const { sites } = useSites();
  
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yy = today.getFullYear().toString().slice(-2);
  const formattedDate = `${dd}/${mm}/${yy}`;

  // Check if we are on a site detail page
  const siteMatch = location.pathname.match(/^\/sites\/([^/]+)/);
  const siteId = siteMatch ? siteMatch[1] : null;
  const site = siteId ? sites.find(s => s.id === siteId) : null;

  const citation = site 
    ? `Charlie Rolph-Kevlahan, ${site.name}, "Templum." templum.wiki. https://templum.wiki/sites/${site.id} (accessed ${formattedDate}).`
    : `Charlie Rolph-Kevlahan, "Templum." templum.wiki. https://templum.wiki/ (accessed ${formattedDate}).`;

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      {/* Mobile Filter Toggle FAB - Decoupled from citation banner */}
      {(location.pathname === '/browse' || location.pathname === '/map' || location.pathname === '/sites') && (
        <div className="lg:hidden fixed bottom-8 right-8 z-50">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-browse-filters'))}
            className="p-4 bg-primary text-on-primary shadow-2xl rounded-full flex items-center gap-2 border border-white/10"
            title="Open Filters"
          >
            <Filter size={24} />
            <span className="font-label text-[12px] uppercase tracking-widest font-bold pr-1">Filters</span>
          </motion.button>
        </div>
      )}

      {/* Reference Archive Banner - Only shown on site detail pages */}
      {siteId && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container/80 backdrop-blur-lg border-t border-primary/10 px-8 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <BookOpen className="text-primary hidden sm:block" size={18} />
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase font-bold text-primary leading-none">Reference Archive</span>
              <span className="font-body text-xs italic text-on-surface-variant">
                Cite this page: {citation}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCopy}
              className="text-primary hover:underline font-label text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors duration-200"
            >
              <Copy size={14} className={copied ? "text-green-500" : ""} />
              {copied ? "Copied!" : "Copy Citation"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
