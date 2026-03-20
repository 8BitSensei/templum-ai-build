import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Site, sites as initialSites } from '../data/sites';
import { fetchSites } from '../services/githubService';

interface SiteContextType {
  sites: Site[];
  loading: boolean;
  error: string | null;
  minYear: number;
  maxYear: number;
  refreshSites: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minYear, setMinYear] = useState(-500);
  const [maxYear, setMaxYear] = useState(600);

  const loadSites = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSites = await fetchSites();
      if (fetchedSites.length > 0) {
        setSites(fetchedSites);
        
        // Calculate min/max years
        let min = Infinity;
        let max = -Infinity;
        fetchedSites.forEach(site => {
          min = Math.min(min, site.startYear);
          max = Math.max(max, site.endYear);
        });
        
        if (min !== Infinity) setMinYear(min);
        if (max !== -Infinity) setMaxYear(max);
      }
    } catch (err) {
      setError('Failed to load sites from GitHub. Using local data instead.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <SiteContext.Provider value={{ sites, loading, error, minYear, maxYear, refreshSites: loadSites }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSites() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSites must be used within a SiteProvider');
  }
  return context;
}
