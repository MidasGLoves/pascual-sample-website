import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-navy/90 backdrop-blur-md py-4 shadow-lg shadow-black/20' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="font-serif text-xl font-bold tracking-widest text-white">
            OBAMA <span className="text-gold">44</span>
          </div>
          <button onClick={() => setIsOpen(true)} className="text-white hover:text-gold transition-colors">
            <Menu size={28} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-50 bg-navy flex flex-col items-center justify-center"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white hover:text-gold transition-colors">
              <X size={32} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col gap-8 text-center font-serif text-4xl md:text-6xl">
              {['The Story', 'The Presidency', 'Historic Firsts', 'Legacy'].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gold transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
