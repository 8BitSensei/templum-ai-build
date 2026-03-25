import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const About = () => {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = "About | Templum";
  }, []);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* Hero */}
      <section className="px-8 pt-32 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-7">
            <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">About the Project</span>
            <h1 className="text-6xl md:text-8xl text-primary leading-tight mb-8">
              Ritual Sites in <br/><span className="italic text-primary-container">Britain & Ireland.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-5 pt-4">
            <p className="text-on-surface text-xl leading-relaxed font-body italic border-l-2 border-primary/20 pl-6">
              Templum is an open source website which provides an explorable GUI for an open-source dataset of Ritual Sites in Britain & Ireland. Templum and it’s accompanying dataset is an attempt to collate evidence for Late Iron Age to Late Antique ritual sites and provide complete bibliographies and locations in a single place.
            </p>
          </div>
        </div>
      </section>

      {/* Scope */}
      <section id="scope" className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">Project Scope</span>
              <h2 className="text-4xl md:text-5xl mb-8 leading-tight text-primary">Defining the <span className="italic">Temple.</span></h2>
              <div className="space-y-6 text-on-surface leading-relaxed font-body text-lg">
                <p>
                  Templum is currently scoped towards what are understood to be ‘temple’ sites, that is constructed buildings and their environs used for, or dedicated to religious activity, this includes sites from Late-Iron Age shrines, Roman Temples, to Early Christian Churches.
                </p>
                <p>
                  We understand that the what is defined as a temple can be vague and so we intend to keep our understanding of the term porous, allowing us to study continuous or related activity that pre-dates or post-dates the constructed environs.
                </p>
                <p className="text-sm text-on-surface-variant italic">
                  All discussions on this topic should happen within either the Templum website repo or the dataset repo to keep a record.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <div className="bg-surface p-10 md:p-16 shadow-sm border-l-4 border-primary">
                <h3 className="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-8">Current Entry Criteria</h3>
                <ul className="space-y-10">
                  {[
                    { 
                      title: 'Geographic Boundaries', 
                      text: 'Entries should have an identifiable location within the boundaries of the islands of Britain & Ireland including off-shore islands.' 
                    },
                    { 
                      title: 'Temporal Range', 
                      text: 'The time-frame for entries should be kept within the Late Iron Age to Late Antiquity for Britain & Ireland, that is roughly 150BCE to 600CE. The constructed environs that make up a temple should fall in this time frame, but contiguous activity may extend beyond these boundaries.' 
                    },
                    { 
                      title: 'Typological Argument', 
                      text: 'There should at least be a reasonable argument for a site being a temple, understanding that it is not always easy to seperate these sites from others.' 
                    },
                    { 
                      title: 'Data Requirements', 
                      text: 'An entry should provide at least the common name for the site, the location, the date range of use, a description, and a bibliography. To see further details on the entry format ',
                      link: { text: 'go here', url: 'https://github.com/8BitSensei/Templum-Data' }
                    }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-6">
                      <span className="font-label font-bold text-primary/40 text-xl">0{idx + 1}</span>
                      <div>
                        <h4 className="font-label text-[11px] uppercase tracking-widest text-primary mb-2">{item.title}</h4>
                        <p className="text-on-surface font-body leading-relaxed">
                          {item.text}
                          {item.link && (
                            <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:text-primary-container transition-colors">
                              {item.link.text}
                            </a>
                          )}
                          {item.link && '.'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">Contact</span>
            <h2 className="text-5xl md:text-7xl text-primary leading-tight mb-8">Get in <br/><span className="italic text-primary-container">Touch.</span></h2>
          </div>
          
          <div className="bg-surface-container-high p-12 shadow-sm border-l-4 border-primary">
            <div className="space-y-8">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold block mb-2">Author & Developer</span>
                <h3 className="text-3xl text-on-surface">Charlie Rolph-Kevlahan</h3>
              </div>
              
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</span>
                <a 
                  href="mailto:templum.data@gmail.com" 
                  className="text-2xl text-primary hover:underline transition-all font-body break-all"
                >
                  templum.data@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Social Media */}
      <section id="social" className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="font-label text-[12px] tracking-[0.2em] text-on-surface-variant uppercase mb-4 block">Updates</span>
          <h2 className="text-4xl md:text-5xl mb-8 leading-tight text-primary">Follow the <span className="italic">Progress.</span></h2>
          <p className="text-on-surface-variant text-lg leading-relaxed font-body max-w-2xl mb-10">
            Stay updated with the latest dataset additions, research findings, and platform updates by following our official social media presence.
          </p>
          
          <a 
            href="https://bsky.app/profile/templum.wiki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 p-8 bg-surface shadow-sm border border-black/5 hover:border-primary/20 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 10.8c-1.32-2.4-4.44-7.44-7.92-9.24C2.16.6 0 .96 0 3.36c0 1.2.6 4.8 1.2 6 1.2 2.4 4.8 3.12 7.2 2.64-2.4.48-6 .24-7.2 2.64-.6 1.2-1.2 4.8-1.2 6 0 2.4 2.16 2.76 4.08 1.8 3.48-1.8 6.6-6.84 7.92-9.24 1.32 2.4 4.44 7.44 7.92 9.24 1.92.96 4.08.6 4.08-1.8 0-1.2-.6-4.8-1.2-6-1.2-2.4-4.8-3.12-7.2-2.64 2.4-.48 6-.24 7.2-2.64.6-1.2 1.2-4.8 1.2-6 0-2.4-2.16-2.76-4.08-1.8-3.48 1.8-6.6 6.84-7.92 9.24Z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">BlueSky</span>
              <span className="text-xl text-primary font-body">@templum.wiki</span>
            </div>
          </a>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
