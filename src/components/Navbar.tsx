import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, Wrench, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'About Us', href: '#about' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex justify-between items-center transition-all duration-500 px-8 py-4 rounded-full ${scrolled ? 'glass-dark shadow-strong' : 'bg-transparent'}`}>
            
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-white font-display font-black text-2xl tracking-tighter cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
                <Wrench className="text-midnight" size={20} strokeWidth={3} />
              </div>
              <span className="hidden sm:block">IRONFLOW</span>
            </motion.div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-10 font-display text-xs font-black uppercase tracking-widest text-white/80">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-teal transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* CTA & Emergency */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="tel:5125550199" className="flex items-center gap-3 text-white font-mono text-xs hover:text-teal transition-colors group">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="font-bold text-teal group-hover:underline underline-offset-4">(512) 555-0199</span>
              </a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact" 
                className="bg-teal text-midnight px-8 py-3 rounded-full font-display font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)] flex items-center gap-2"
              >
                Book Online
                <ArrowRight size={14} strokeWidth={3} />
              </motion.a>
              <button 
                onClick={() => navigate('/admin')} 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all" 
                title="Admin Login"
              >
                <Lock size={16} />
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-4">
              <button onClick={() => navigate('/admin')} className="text-white/50 hover:text-white transition-colors">
                <Lock size={20} />
              </button>
              <button 
                onClick={() => setIsOpen(true)} 
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:text-teal transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-midnight/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-2 text-white font-display font-black text-2xl tracking-tighter">
                <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center">
                  <Wrench className="text-midnight" size={20} strokeWidth={3} />
                </div>
                IRONFLOW
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:text-teal transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-8 font-display text-5xl font-black text-white tracking-tighter">
              {navLinks.map((link, i) => (
                <motion.a 
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  onClick={() => setIsOpen(false)}
                  className="hover:text-teal transition-colors flex items-center gap-4 group"
                >
                  <span className="text-teal/20 group-hover:text-teal transition-colors">0{i+1}</span>
                  {link.name}
                </motion.a>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                href="tel:5125550199" 
                className="flex items-center justify-center gap-3 bg-red-600 text-white w-full py-6 rounded-2xl font-display font-black text-xl tracking-tight"
              >
                <Phone size={24} fill="white" />
                (512) 555-0199
              </motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                href="#contact" 
                onClick={() => setIsOpen(false)} 
                className="bg-teal text-midnight w-full py-6 rounded-2xl font-display font-black text-xl tracking-tight text-center block"
              >
                BOOK SERVICE ONLINE
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
