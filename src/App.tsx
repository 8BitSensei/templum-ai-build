import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { TopAppBar } from './components/TopAppBar';
import { Footer } from './components/Footer';
import { CitationDrawer } from './components/CitationDrawer';
import { SiteProvider } from './context/SiteContext';
import Home from './pages/Home';
import Browse from './pages/Browse';
import SiteDetail from './pages/SiteDetail';
import About from './pages/About';
import MapView from './pages/MapView';

export default function App() {
  return (
    <SiteProvider>
      <Router>
          <div className="min-h-screen flex flex-col bg-surface">
            <TopAppBar />
            <main className="flex-grow pt-16">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/sites" element={<Browse />} />
                  <Route path="/sites/:id" element={<SiteDetail />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
            <CitationDrawer />
          </div>
        </Router>
      </SiteProvider>
  );
}
