import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Layers, Search, Settings, HelpCircle, FolderArchive, ChevronUp, Calendar, X, ExternalLink, Loader2, Filter } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Site } from '../data/sites';
import { useSites } from '../context/SiteContext';
import TemporalHistogramSlider from '../components/TemporalHistogramSlider';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to get color based on certainty
const getCertaintyColor = (certainty: string) => {
  switch (certainty) {
    case 'Certain': return '#10b981'; // emerald-500
    case 'Probable': return '#84cc16'; // lime-500
    case 'Possible': return '#f59e0b'; // amber-500
    case 'Unlikely': return '#f43f5e'; // rose-500
    default: return '#72787a'; // outline
  }
};

// Custom Marker Component to handle dynamic icons
const CertaintyMarker = ({ site, onClick }: { site: Site, onClick: () => void, key?: React.Key }) => {
  const color = getCertaintyColor(site.certainty);
  
  const icon = useMemo(() => L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  }), [color]);

  return (
    <Marker 
      position={[site.lat, site.lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup closeButton={false} className="custom-popup">
        <div className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">
          {site.name}
        </div>
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  const { sites, loading, error, minYear, maxYear } = useSites();
  const [searchParams] = useSearchParams();
  
  const [startDate, setStartDate] = useState(-150);
  const [endDate, setEndDate] = useState(600);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCertainty, setSelectedCertainty] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [excludeUnknownStart, setExcludeUnknownStart] = useState(false);
  const [excludeUnknownEnd, setExcludeUnknownEnd] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
          const searchText = `${site.name} ${site.location} ${site.description}`.toLowerCase();
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

    return result;
  }, [sites, searchQuery, startDate, endDate, selectedRegions, selectedCertainty, excludeUnknownStart, excludeUnknownEnd]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-[calc(100vh-64px)] overflow-hidden relative"
    >
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
            className="fixed inset-y-0 left-0 w-80 bg-surface-container-low z-[101] shadow-2xl lg:hidden overflow-y-auto px-6 py-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl text-primary italic">Filter Archive</h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent 
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

      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-72 flex-shrink-0 bg-surface-container-low overflow-y-auto px-6 py-8 border-r border-black/5 z-40">
        <header className="mb-10">
          <h2 className="text-2xl text-primary mb-2">Filter Archive</h2>
        </header>

        <SidebarContent 
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

      {/* Main Map Area */}
      <main className="flex-grow relative bg-surface-container-low">
        {loading ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm">
            <Loader2 className="animate-spin mb-4 text-primary" size={48} />
            <p className="font-label text-xs uppercase tracking-widest text-primary">Calibrating Geographic Archive</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 text-rose-700 max-w-md text-center">
              <p className="font-body text-sm">{error}</p>
            </div>
          </div>
        ) : null}

        <MapContainer 
          center={[54.5, -3.5]} 
          zoom={6} 
          className="w-full h-full z-10"
          zoomControl={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Satellite Imagery">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {filteredSites.map(site => (
            <CertaintyMarker 
              key={site.id} 
              site={site}
              onClick={() => setSelectedSite(site)}
            />
          ))}
        </MapContainer>

        {/* Site Selection Card Overlay */}
        <AnimatePresence>
          {selectedSite && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-8 right-8 z-30 w-80 bg-surface shadow-2xl border border-black/5 overflow-hidden"
            >
              <div className="p-6 relative">
                <button 
                  onClick={() => setSelectedSite(null)}
                  className="absolute top-4 right-4 p-1 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex justify-between items-start mb-3 pr-8">
                  <div>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">ID: {selectedSite.id}</span>
                    <h3 className="text-xl font-bold text-primary italic leading-tight">{selectedSite.name}</h3>
                  </div>
                  <span className={`font-label text-[8px] uppercase tracking-widest px-2 py-0.5 border ${
                    selectedSite.certainty === 'Certain' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                    selectedSite.certainty === 'Probable' ? 'bg-lime-500/10 text-lime-700 border-lime-500/20' :
                    selectedSite.certainty === 'Possible' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}>
                    {selectedSite.certainty}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">
                    <Calendar size={12} className="text-primary" />
                    <span>{selectedSite.period}</span>
                  </div>
                  <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">
                    <MapPin size={12} className="text-primary" />
                    <span>{selectedSite.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-6">
                  {selectedSite.tags.slice(0, 3).map((tag, index) => (
                    <span key={`${tag}-${index}`} className="font-label text-[8px] px-2 py-0.5 bg-surface-container-high text-on-surface-variant uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link 
                  to={`/sites/${selectedSite.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest font-bold hover:bg-primary-container transition-colors"
                >
                  View Full Archive Entry
                  <ExternalLink size={12} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-10 left-8 z-30">
          <div className="bg-surface/80 backdrop-blur-lg p-4 shadow-sm border border-black/5">
            <h4 className="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Site Certainty</h4>
            <div className="space-y-3">
              {[
                { name: 'Certain', color: 'bg-emerald-500' },
                { name: 'Probable', color: 'bg-lime-500' },
                { name: 'Possible', color: 'bg-amber-500' },
                { name: 'Unlikely', color: 'bg-rose-500' }
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="fixed bottom-0 left-0 lg:left-72 right-0 h-12 bg-surface-container/90 backdrop-blur-md z-40 flex items-center px-4 lg:px-8 border-t border-black/5">
        <div className="flex items-center gap-4 lg:gap-8 w-full overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 flex items-center gap-2">
            <FolderArchive className="text-primary" size={16} />
            <span className="font-label text-[9px] uppercase tracking-widest font-bold whitespace-nowrap">Research Bundle: (04)</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 overflow-hidden">
            <span className="font-label text-[9px] uppercase text-on-surface-variant whitespace-nowrap">Heracleion_Summary.pdf</span>
            <span className="font-label text-[9px] uppercase text-on-surface-variant whitespace-nowrap">Thonis_Coordinates.csv</span>
          </div>
          <button className="ml-auto flex-shrink-0 flex items-center gap-2 group">
            <span className="font-label text-[9px] uppercase font-bold tracking-widest group-hover:text-primary whitespace-nowrap">Open Archive Drawer</span>
            <ChevronUp size={14} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

const SidebarContent = ({ 
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
  <>
    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-4">Keyword Search</h3>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search sites, locations, or descriptions..."
          className="w-full bg-surface-container-high border border-outline/20 px-4 py-2 font-body text-sm focus:outline-none focus:border-primary transition-colors pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute right-3 top-2.5 text-on-surface-variant/50" size={16} />
      </div>
    </section>

    <section className="mb-12">
      <h3 className="font-label text-[12px] uppercase tracking-widest text-primary font-bold mb-6">Temporal Range</h3>
      <TemporalHistogramSlider 
        sites={sites}
        startDate={startDate}
        endDate={endDate}
        onRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      <div className="space-y-2 pt-4">
        <label className="flex items-center gap-3 group cursor-pointer py-1">
          <input 
            type="checkbox" 
            checked={excludeUnknownStart}
            onChange={(e) => setExcludeUnknownStart(e.target.checked)}
            className="rounded-none border-outline text-primary focus:ring-primary" 
          />
          <span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">Exclude Unknown Start Dates</span>
        </label>
        <label className="flex items-center gap-3 group cursor-pointer py-1">
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
      <div className="space-y-2">
        {['England', 'Wales', 'Scotland', 'Ireland'].map(region => (
          <label key={region} className="flex items-center gap-3 group cursor-pointer py-1">
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
      <div className="space-y-2">
        {['Certain', 'Probable', 'Possible', 'Unlikely'].map(certainty => (
          <label key={certainty} className="flex items-center gap-3 group cursor-pointer py-1">
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
  </>
);

export default MapView;
