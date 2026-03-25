import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Calendar, ChevronDown, Search, Loader2, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSites } from '../context/SiteContext';
import TemporalHistogramSlider from '../components/TemporalHistogramSlider';
import { cn } from '../lib/utils';

const Browse = () => {
  const { sites, loading, error, minYear, maxYear } = useSites();
  const [searchParams] = useSearchParams();
  
  const [startDate, setStartDate] = useState(-150);
  const [endDate, setEndDate] = useState(600);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'latest' | 'certainty-desc' | 'certainty-asc' | 'alpha'>('certainty-desc');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCertainty, setSelectedCertainty] = useState<string[]>([]);
  const [excludeUnknownStart, setExcludeUnknownStart] = useState(false);
  const [excludeUnknownEnd, setExcludeUnknownEnd] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "Browse | Templum";
  }, []);

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(true);
    window.addEventListener('toggle-browse-filters', handleToggle);
    return () => window.removeEventListener('toggle-browse-filters', handleToggle);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const period = searchParams.get('period');
    const region = searchParams.get('region');
    const certainty = searchParams.get('certainty');

    if (q) setSearchQuery(q);
    
    if (period) {
      if (period.includes('Iron Age')) {
        setStartDate(-150);
        setEndDate(43);
      } else if (period.includes('Roman')) {
        setStartDate(43);
        setEndDate(410);
      } else if (period.includes('Early Medieval')) {
        setStartDate(410);
        setEndDate(600);
      }
    }

    if (region && region !== 'All Regions') {
      setSelectedRegions([region]);
    }

    if (certainty && certainty !== 'All Certainty') {
      setSelectedCertainty([certainty]);
    }
  }, [searchParams]);

  const formatYear = (year: number) => {
    if (year === -150) return 'pre 150 BCE';
    if (year === 600) return 'post 600 CE';
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  };

  const filteredSites = useMemo(() => {
    let result = [...sites];

    // Temporal Filter (Overlap Logic)
    result = result.filter(site => {
      if (excludeUnknownStart && site.isStartYearUnknown) return false;
      if (excludeUnknownEnd && site.isEndYearUnknown) return false;

      const effectiveStart = startDate === -150 ? -1000000 : startDate;
      const effectiveEnd = endDate === 600 ? 1000000 : endDate;

      return site.startYear <= effectiveEnd && site.endYear >= effectiveStart;
    });

    // Geographic Filter
    if (selectedRegions.length > 0) {
      result = result.filter(site => 
        selectedRegions.some(region => site.location.includes(region))
      );
    }

    // Certainty Filter
    if (selectedCertainty.length > 0) {
      result = result.filter(site => 
        selectedCertainty.includes(site.certainty)
      );
    }

    // Keyword Search Logic
    if (searchQuery.trim()) {
      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
      
      result = result
        .map(site => {
          const searchText = `${site.name} ${site.location} ${site.description} ${site.tags.join(' ')}`.toLowerCase();
          const matchCount = keywords.reduce((count, keyword) => {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedKeyword, 'g');
            const matches = searchText.match(regex);
            return count + (matches ? matches.length : 0);
          }, 0);
          return { ...site, matchCount };
        })
        .filter(site => (site as any).matchCount > 0);
    }

    // Sorting Logic
    const certaintyOrder: Record<string, number> = {
      'Certain': 4,
      'Probable': 3,
      'Possible': 2,
      'Unlikely': 1
    };

    result.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.startYear - b.startYear;
      } else if (sortOrder === 'latest') {
        return b.startYear - a.startYear;
      } else if (sortOrder === 'certainty-desc') {
        return certaintyOrder[b.certainty] - certaintyOrder[a.certainty];
      } else if (sortOrder === 'certainty-asc') {
        return certaintyOrder[a.certainty] - certaintyOrder[b.certainty];
      } else if (sortOrder === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [sites, searchQuery, sortOrder, startDate, endDate, selectedRegions, selectedCertainty, excludeUnknownStart, excludeUnknownEnd]);

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };

  const toggleCertainty = (certainty: string) => {
    setSelectedCertainty(prev => 
      prev.includes(certainty) 
        ? prev.filter(c => c !== certainty) 
        : [...prev, certainty]
    );
  };

  const getCertaintyColor = (certainty: string) => {
    switch (certainty) {
      case 'Certain': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'Probable': return 'bg-lime-500/10 text-lime-700 border-lime-500/20';
      case 'Possible': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'Unlikely': return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
      default: return 'bg-outline/10 text-on-surface-variant border-outline/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-[calc(100vh-64px)] overflow-hidden relative"
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 bg-surface-container-low overflow-y-auto px-6 pt-8 pb-24 border-r border-black/5">
        <SidebarContent 
          setIsSidebarOpen={setIsSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sites={sites}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          excludeUnknownStart={excludeUnknownStart}
          setExcludeUnknownStart={setExcludeUnknownStart}
          excludeUnknownEnd={excludeUnknownEnd}
          setExcludeUnknownEnd={setExcludeUnknownEnd}
          selectedRegions={selectedRegions}
          toggleRegion={toggleRegion}
          selectedCertainty={selectedCertainty}
          toggleCertainty={toggleCertainty}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-out Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-surface-container-low z-[101] shadow-2xl lg:hidden overflow-y-auto px-6 pt-8 pb-24 border-r border-black/5"
          >
            <SidebarContent 
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sites={sites}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              excludeUnknownStart={excludeUnknownStart}
              setExcludeUnknownStart={setExcludeUnknownStart}
              excludeUnknownEnd={excludeUnknownEnd}
              setExcludeUnknownEnd={setExcludeUnknownEnd}
              selectedRegions={selectedRegions}
              toggleRegion={toggleRegion}
              selectedCertainty={selectedCertainty}
              toggleCertainty={toggleCertainty}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Results List */}
      <section className="flex-grow bg-surface overflow-y-auto">
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div>
                <h1 className="text-3xl md:text-4xl text-on-surface">Sites</h1>
                <p className="font-body italic text-on-surface-variant mt-1">
                  {loading ? 'Fetching archive...' : `${filteredSites.length} entries found`}
                </p>
              </div>
            </div>
            <div className="relative group w-full md:w-auto">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="appearance-none bg-transparent pr-8 font-label text-[10px] uppercase text-on-surface-variant cursor-pointer hover:text-primary focus:outline-none w-full md:w-auto"
              >
                <option value="certainty-desc">Sort Most Certain to Least</option>
                <option value="certainty-asc">Sort Least Certain to Most</option>
                <option value="oldest">Sort Oldest to Latest</option>
                <option value="latest">Sort Latest to Oldest</option>
                <option value="alpha">Sort Alphabetically</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={14} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-label text-xs uppercase tracking-widest text-center">Synchronizing with Templum Data Repository</p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 text-rose-700">
              <p className="font-body text-sm">{error}</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-outline/20">
              <p className="font-body text-on-surface-variant italic">No sites match your current classification criteria.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredSites.map(site => (
                <Link key={site.id} to={`/sites/${site.id}`}>
                  <article className="group cursor-pointer flex flex-col sm:flex-row gap-4 sm:gap-6 items-start mb-12">
                    <div className="flex-grow w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl text-primary group-hover:underline decoration-1 underline-offset-4">{site.name}</h3>
                          <span className={`font-label text-[8px] uppercase tracking-widest px-2 py-0.5 border ${getCertaintyColor(site.certainty)}`}>
                            {site.certainty}
                          </span>
                        </div>
                        <span className="font-label text-[10px] text-on-surface-variant italic">#{site.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-3 font-label text-[11px] uppercase tracking-tighter text-on-surface-variant">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {site.location}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {site.period}</span>
                      </div>
                      <p className="font-body text-sm text-on-surface line-clamp-2 leading-relaxed opacity-90">
                        {site.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {site.tags.map((tag, index) => (
                          <span key={`${tag}-${index}`} className="font-label text-[9px] px-2 py-0.5 border border-outline/20 text-on-surface-variant">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const SidebarContent = ({ 
  setIsSidebarOpen, 
  searchQuery, 
  setSearchQuery, 
  sites, 
  startDate, 
  endDate, 
  setStartDate, 
  setEndDate, 
  excludeUnknownStart, 
  setExcludeUnknownStart, 
  excludeUnknownEnd, 
  setExcludeUnknownEnd, 
  selectedRegions, 
  toggleRegion, 
  selectedCertainty, 
  toggleCertainty 
}: any) => (
  <div className="flex flex-col">
    <header className="mb-10 flex justify-between items-start">
      <div>
        <h2 className="text-2xl text-primary mb-2">Filter Archive</h2>
      </div>
      <button 
        onClick={() => setIsSidebarOpen(false)}
        className="lg:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
      >
        <X size={20} />
      </button>
    </header>

    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-4">Keyword Search</h3>
      <div className="space-y-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search sites, locations, or descriptions..."
            className="w-full bg-surface-container-high border border-outline/20 px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </section>

    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-3">Temporal Range</h3>
      <TemporalHistogramSlider 
        sites={sites}
        startDate={startDate}
        endDate={endDate}
        onRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      <div className="space-y-1 pt-2">
        <label className="flex items-center gap-3 group cursor-pointer py-0.5">
          <input 
            type="checkbox" 
            checked={excludeUnknownStart}
            onChange={(e) => setExcludeUnknownStart(e.target.checked)}
            className="rounded-none border-outline text-primary focus:ring-primary" 
          />
          <span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">Exclude Unknown Start Dates</span>
        </label>
        <label className="flex items-center gap-3 group cursor-pointer py-0.5">
          <input 
            type="checkbox" 
            checked={excludeUnknownEnd}
            onChange={(e) => setExcludeUnknownEnd(e.target.checked)}
            className="rounded-none border-outline text-primary focus:ring-primary" 
          />
          <span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">Exclude Unknown End Dates</span>
        </label>
      </div>
    </section>

    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-4">Geographic Focus</h3>
      <div className="space-y-1">
        {['England', 'Wales', 'Scotland', 'Ireland'].map(region => (
          <label key={region} className="flex items-center gap-3 group cursor-pointer py-0.5">
            <input 
              type="checkbox" 
              checked={selectedRegions.includes(region)}
              onChange={() => toggleRegion(region)}
              className="rounded-none border-outline text-primary focus:ring-primary" 
            />
            <span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">{region}</span>
          </label>
        ))}
      </div>
    </section>

    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-4">Certainty</h3>
      <div className="space-y-1">
        {['Certain', 'Probable', 'Possible', 'Unlikely'].map(certainty => (
          <label key={certainty} className="flex items-center gap-3 group cursor-pointer py-0.5">
            <input 
              type="checkbox" 
              checked={selectedCertainty.includes(certainty)}
              onChange={() => toggleCertainty(certainty)}
              className="rounded-none border-outline text-primary focus:ring-primary" 
            />
            <span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">{certainty}</span>
          </label>
        ))}
      </div>
    </section>
  </div>
);

export default Browse;
