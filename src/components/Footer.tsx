import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-primary text-surface pt-4 pb-12 md:pb-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <div className="font-headline text-xl italic mb-2">Templum</div>
          <p className="font-label text-[10px] tracking-widest opacity-60 uppercase">
            © 2026 Templum. MIT License.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 md:gap-10">
          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Research</span>
            <Link to="/about#scope" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Scope</Link>
            <a 
              href="/api/github/sites" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              Raw Data
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Source</span>
            <a 
              href="https://github.com/8BitSensei/Templum-Data" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              GitHub
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Connect</span>
            <Link to="/about#contact" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Contact Team</Link>
            <Link to="/about#social" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Social Media</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
