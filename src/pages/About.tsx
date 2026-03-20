import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* Hero */}
      <section className="px-8 pt-32 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-8">
            <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">Our Mission</span>
            <h1 className="text-6xl md:text-8xl text-primary leading-tight">
              Preserving the <br/><span className="italic text-primary-container">Fragmented Past.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 pb-4">
            <p className="text-on-surface-variant text-lg leading-relaxed font-body">
              Templum is a collaborative scholarly initiative dedicated to the systematic cataloging and digital reconstruction of classical Mediterranean inscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <div className="space-y-8">
              <div className="bg-surface p-12 shadow-sm border-l-4 border-primary">
                <h2 className="text-3xl mb-6">Core Objectives</h2>
                <ul className="space-y-6">
                  {[
                    { id: '01', text: 'Digital preservation of endangered physical artifacts through high-resolution photogrammetry.' },
                    { id: '02', text: 'Open-access dissemination of structured archaeological metadata for the global research community.' },
                    { id: '03', text: 'Application of neural networks to hypothesize and complete missing textual fragments.' }
                  ].map(obj => (
                    <li key={obj.id} className="flex gap-4">
                      <span className="font-label font-bold text-primary">{obj.id}</span>
                      <p className="text-on-surface font-body">{obj.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-8">
              <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">Scholarly Methodology</span>
              <h2 className="text-4xl mb-8 leading-snug">A standard of precision that bridges centuries.</h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed font-body">
                <p>Our methodology integrates traditional philological analysis with advanced computational archaeology. Every artifact undergoes a rigorous three-stage verification process.</p>
                <p>We leverage a bespoke schema designed for high-density historical data, ensuring that temporal, spatial, and material metadata remain intrinsically linked.</p>
              </div>
              <button className="mt-10 bg-primary text-on-primary px-8 py-4 rounded-sm font-label text-[12px] tracking-widest uppercase hover:opacity-90 transition-all flex items-center gap-2">
                Review Methodology Report <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">The Faculty</span>
          <h2 className="text-5xl">The Research Team</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { name: 'Dr. Julian Thorne', role: 'Director of Epigraphy', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600' },
            { name: 'Prof. Elena Moretti', role: 'Computational Lead', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600' },
            { name: 'Marcus Vane', role: 'Head of Field Operations', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600' }
          ].map(person => (
            <div key={person.name} className="group">
              <div className="aspect-[4/5] bg-surface-container-high mb-6 overflow-hidden">
                <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={person.img} alt={person.name} referrerPolicy="no-referrer" />
              </div>
              <div className="px-2">
                <h3 className="text-2xl mb-1">{person.name}</h3>
                <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-4">{person.role}</p>
                <p className="text-sm leading-relaxed text-on-surface-variant font-body">Specializing in Late Bronze Age scripts and the digital philology of the Aegean.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default About;
