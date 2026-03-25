import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, ShieldCheck, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import ReactMarkdown from 'react-markdown';
import { useSites } from '../context/SiteContext';

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

const SiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { sites, loading } = useSites();
  const site = sites.find(s => s.id === id);

  useEffect(() => {
    if (site) {
      document.title = `🏛️ ${site.name} | Templum`;
    } else if (!loading) {
      document.title = "🏛️ Site Not Found | Templum";
    }
  }, [site, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-surface">
        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
        <p className="font-label text-xs uppercase tracking-widest text-primary">Retrieving Archive Entry</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-surface">
        <h2 className="text-3xl text-primary mb-4 italic">Site Not Found</h2>
        <Link to="/browse" className="text-primary border-b border-primary/20 hover:border-primary transition-all font-label text-sm tracking-widest uppercase">
          Return to Archive
        </Link>
      </div>
    );
  }

  const getCertaintyStyle = (certainty: string) => {
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
      className="max-w-7xl mx-auto px-8 py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Details & Description */}
        <div className="lg:col-span-7">
          <header className="mb-10">
            <span className="font-label text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mb-2 block">Site Entry Ref. {site.id}</span>
            <h1 className="text-4xl md:text-5xl text-primary italic leading-tight mb-6">{site.name}</h1>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-6 border-y border-black/5">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5" />
                <div>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-0.5">Location</span>
                  <span className="font-body text-sm font-medium">{site.location}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-primary mt-0.5" />
                <div>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-0.5">Period</span>
                  <span className="font-body text-sm font-medium">{site.period}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-primary mt-0.5" />
                <div>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-0.5">Certainty</span>
                  <span className={`font-label text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${getCertaintyStyle(site.certainty)}`}>
                    {site.certainty}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-primary mt-0.5" />
                <div>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-0.5">Tags</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {site.tags.map((tag, index) => (
                      <React.Fragment key={`${tag}-${index}`}>
                        <Link 
                          to={`/browse?q=${encodeURIComponent(tag)}`}
                          className="font-body text-sm font-medium text-primary/80 italic hover:text-primary hover:underline transition-colors"
                        >
                          {tag}
                        </Link>
                        {index < site.tags.length - 1 && <span className="text-primary/40">,</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <article className="prose prose-sm max-w-none">
            <div className="markdown-body font-body text-base leading-relaxed text-on-surface space-y-6">
              <ReactMarkdown>{site.description}</ReactMarkdown>
              
              <div className="mt-12 pt-8 border-t border-black/5">
                <h3 className="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-4">Bibliography</h3>
                <ul className="space-y-3">
                  {site.bibliography.map((ref, index) => (
                    <li key={index} className="font-body text-xs text-on-surface-variant leading-relaxed">
                      <ReactMarkdown>{ref}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="h-[400px] w-full bg-surface-container-high border border-black/5 shadow-sm relative overflow-hidden">
              <MapContainer 
                center={[site.lat, site.lng]} 
                zoom={13} 
                className="w-full h-full z-10"
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                />
                <Marker position={[site.lat, site.lng]} icon={DefaultIcon} />
              </MapContainer>
            </div>
            <div className="mt-4 p-4 bg-surface-container-low border border-black/5">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-2">Geographic Coordinates</span>
              <code className="font-mono text-xs text-primary">{site.lat.toFixed(6)}, {site.lng.toFixed(6)}</code>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteDetail;
