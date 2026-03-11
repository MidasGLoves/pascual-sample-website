import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, Droplet, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-midnight/95 backdrop-blur-md py-4 shadow-lg border-b border-teal/20' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 text-white font-display font-black text-2xl tracking-tight">
            <Droplet className="text-teal fill-teal" size={24} />
            IRONFLOW
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 font-sans text-sm font-medium text-white/90">
            <a href="#services" className="hover:text-teal transition-colors">Services</a>
            <a href="#about" className="hover:text-teal transition-colors">About Us</a>
            <a href="#reviews" className="hover:text-teal transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-teal transition-colors">Contact</a>
          </div>

          {/* CTA & Emergency */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="tel:5125550199" className="flex items-center gap-2 text-white font-mono text-sm hover:text-teal transition-colors">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              24/7 EMERGENCY: <span className="font-bold text-teal">(512) 555-0199</span>
            </a>
            <a href="#contact" className="bg-copper hover:bg-copper/90 text-white px-6 py-2.5 rounded-sm font-sans font-semibold text-sm transition-all shadow-[4px_4px_0px_rgba(0,229,255,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,229,255,0.2)] inline-block">
              Book Online
            </a>
            <button onClick={() => setShowLoginModal(true)} className="text-white/50 hover:text-white transition-colors ml-2" title="Admin Login">
              <Lock size={18} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setShowLoginModal(true)} className="text-white/50 hover:text-white transition-colors">
              <Lock size={20} />
            </button>
            <button onClick={() => setIsOpen(true)} className="text-white hover:text-teal transition-colors">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-midnight flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2 text-white font-display font-black text-2xl tracking-tight">
                <Droplet className="text-teal fill-teal" size={24} />
                IRONFLOW
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-teal transition-colors">
                <X size={32} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 font-display text-3xl text-white">
              {['Services', 'About', 'Reviews', 'Contact'].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  onClick={() => setIsOpen(false)}
                  className="hover:text-teal transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="mt-auto pb-8">
              <a href="tel:5125550199" className="flex items-center justify-center gap-2 bg-red-600 text-white w-full py-4 rounded-sm font-display font-bold text-lg mb-4">
                <Phone size={20} />
                EMERGENCY: (512) 555-0199
              </a>
              <a href="#contact" onClick={() => setIsOpen(false)} className="bg-copper text-white w-full py-4 rounded-sm font-display font-bold text-lg inline-block text-center">
                Book Online
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-display font-bold text-xl text-slate900 flex items-center gap-2">
                  <Lock size={20} className="text-teal" /> Admin Access
                </h3>
                <button onClick={() => { setShowLoginModal(false); setLoginError(''); }} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (username === 'Pascual' && password === 'Pascual') {
                    localStorage.setItem('ironflow_admin', 'true');
                    setShowLoginModal(false);
                    navigate('/admin');
                  } else {
                    setLoginError('Invalid credentials');
                  }
                }} 
                className="p-6 space-y-4"
              >
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm font-semibold border border-red-200">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate900 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate900 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <button type="submit" className="w-full bg-midnight text-white font-bold py-3 rounded-sm hover:bg-slate-800 transition-colors mt-2">
                  Login to Dashboard
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
