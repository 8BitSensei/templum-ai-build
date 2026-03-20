import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-primary text-surface py-16 px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-8 md:mb-0">
          <div className="font-headline text-xl italic mb-2">Templum</div>
          <p className="font-label text-[10px] tracking-widest opacity-60 uppercase">
            © 2024 Archaeological Research Project. All rights reserved. Scholarly Digital Archive.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10">
          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Research</span>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity underline decoration-1 underline-offset-4">Methodology</Link>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Citations</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Legal</span>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Ethics Code</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-label text-[10px] text-secondary-container uppercase tracking-widest">Connect</span>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Contact Team</Link>
            <Link to="#" className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity">Data Requests</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
