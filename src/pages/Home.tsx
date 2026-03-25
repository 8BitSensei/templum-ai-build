import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useSites } from '../context/SiteContext';

const Home = () => {
  const navigate = useNavigate();
  const { sites, loading } = useSites();
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('All Eras');
  const [region, setRegion] = useState('All Regions');
  const [certainty, setCertainty] = useState('All Certainty');

  useEffect(() => {
    document.title = "Home | Templum";
  }, []);

  const featuredSites = useMemo(() => {
    // Show the three latest sites added to the dataset
    return [...sites].slice(-3).reverse();
  }, [sites]);

  const handleQuery = () => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (period !== 'All Eras') params.append('period', period);
    if (region !== 'All Regions') params.append('region', region);
    if (certainty !== 'All Certainty') params.append('certainty', certainty);
    
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* Hero Section */}
      <section className="px-8 pt-8 pb-24 flex flex-col items-center text-center bg-surface">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl text-primary mb-6 max-w-4xl leading-tight"
        >
          Cataloguing Temples, Shrines, and Churches, in Britain and Ireland
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-on-surface-variant max-w-2xl mb-12 font-body"
        >
          Welcome to Templum, an open-source amateur project to provide a dataset of Temples, Shrines, and Churches in Britain & Ireland. If you see a mistake or would like to add data please reach out.
        </motion.p>

        {/* Search Bar */}
        <div className="w-full max-w-5xl bg-surface-container-lowest shadow-sm p-4 rounded-lg border-b border-outline/10">
          <div className="flex flex-col gap-4">
            {/* Text Entry */}
            <div className="relative border-b border-outline/10 pb-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 font-body text-xl italic outline-none" 
                placeholder="Search by period, region, or certainty..." 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              />
            </div>
            
            {/* Options and Button */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4 bg-surface-container-low p-6 md:p-2 rounded">
              <div className="flex flex-col md:flex-row flex-grow gap-6 md:gap-4 w-full">
                <div className="flex flex-col items-center md:items-start px-4 border-b md:border-b-0 md:border-r border-outline/10 pb-4 md:pb-0 w-full md:w-auto">
                  <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Period</span>
                  <select 
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="bg-transparent border-none p-0 font-label text-sm text-primary focus:ring-0 cursor-pointer outline-none text-center md:text-left"
                  >
                    <option>All Eras</option>
                    <option>Iron Age (150 BCE - 43 CE)</option>
                    <option>Roman (43 CE - 410 CE)</option>
                    <option>Early Medieval (410 CE - 600 CE)</option>
                  </select>
                </div>
                <div className="flex flex-col items-center md:items-start px-4 border-b md:border-b-0 md:border-r border-outline/10 pb-4 md:pb-0 w-full md:w-auto">
                  <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Region</span>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-transparent border-none p-0 font-label text-sm text-primary focus:ring-0 cursor-pointer outline-none text-center md:text-left"
                  >
                    <option>All Regions</option>
                    <option>England</option>
                    <option>Ireland</option>
                    <option>Wales</option>
                    <option>Scotland</option>
                  </select>
                </div>
                <div className="flex flex-col items-center md:items-start px-4 w-full md:w-auto">
                  <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Certainty</span>
                  <select 
                    value={certainty}
                    onChange={(e) => setCertainty(e.target.value)}
                    className="bg-transparent border-none p-0 font-label text-sm text-primary focus:ring-0 cursor-pointer outline-none text-center md:text-left"
                  >
                    <option>All Certainty</option>
                    <option>Certain</option>
                    <option>Probable</option>
                    <option>Possible</option>
                    <option>Unlikely</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleQuery}
                className="bg-primary text-on-primary px-12 py-3 rounded-sm font-label text-sm tracking-widest hover:bg-primary-container transition-colors w-full md:w-auto md:ml-auto"
              >
                QUERY
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sites */}
      <section className="px-4 md:px-8 py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="font-label text-[12px] text-outline uppercase tracking-[0.2em] block mb-2">Latest Additions</span>
              <h2 className="text-3xl md:text-4xl text-primary">Recently Added Sites</h2>
            </div>
            <Link to="/sites" className="font-label text-sm text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1 w-fit">
              VIEW ALL SITES
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-label text-xs uppercase tracking-widest">Synchronizing Archive</p>
            </div>
          ) : featuredSites.length > 0 ? (
            <div className="grid grid-cols-12 gap-8">
              {/* Large Feature Card */}
              <div className="col-span-12 md:col-span-8 group cursor-pointer relative overflow-hidden h-[320px] md:h-[420px] bg-surface-container-high border border-black/5">
                <Link to={`/sites/${featuredSites[0].id}`} className="block h-full p-6 md:p-10 flex flex-col justify-center">
                  <div className="relative z-10">
                    <div className="bg-secondary-container inline-block px-3 py-1 mb-4">
                      <span className="font-label text-[10px] text-on-secondary-container uppercase tracking-widest">LATEST ADDITION</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl text-primary mb-4 italic">{featuredSites[0].name}</h3>
                    <p className="text-on-surface-variant max-w-xl text-base md:text-lg leading-relaxed font-body line-clamp-3">
                      {featuredSites[0].description}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Small Column */}
              <div className="col-span-12 md:col-span-4 flex flex-col gap-6 md:gap-8">
                {featuredSites.slice(1, 3).map((site, idx) => (
                  <Link key={site.id} to={`/sites/${site.id}`} className={idx === 0 ? "flex-grow" : ""}>
                    {idx === 0 ? (
                      <div className="bg-surface-container-high p-6 md:p-8 h-full flex flex-col justify-between group cursor-pointer hover:bg-surface-container-highest transition-colors border border-black/5">
                        <div>
                          <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-4 block">{site.location}</span>
                          <h3 className="text-2xl text-primary mb-3 italic">{site.name}</h3>
                          <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                            {site.description}
                          </p>
                        </div>
                        <div className="mt-6 flex items-center text-primary gap-2 font-label text-xs font-bold tracking-widest group-hover:gap-4 transition-all">
                          EXPLORE DATA <ArrowRight size={14} />
                        </div>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden h-[180px] md:h-[220px] group cursor-pointer bg-surface-container-high border border-black/5 p-6 md:p-8 flex flex-col justify-center hover:bg-surface-container-highest transition-colors">
                        <div className="relative z-10">
                          <span className="font-label text-[9px] text-outline uppercase tracking-widest mb-2 block">{site.location}</span>
                          <h4 className="text-xl font-bold text-primary tracking-widest uppercase italic mb-2">{site.name}</h4>
                          <p className="font-body text-xs text-on-surface-variant line-clamp-2">{site.description}</p>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-outline/20">
              <p className="font-body text-on-surface-variant italic">No featured sites available at this time.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
