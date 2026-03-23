import { motion } from 'motion/react';
import { ShieldCheck, Clock, Star, ArrowRight, Phone } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-midnight">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-midnight/80 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent z-10" />
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=3000&auto=format&fit=crop" 
          alt="Master Plumber Working" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 z-10 mix-blend-overlay"></div>
      </div>

      {/* Floating Elements for Interactivity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-teal/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-copper/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 text-teal font-mono text-xs font-bold mb-8 tracking-widest uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            Serving Greater Austin, TX • 24/7 Available
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-8 tracking-tighter"
          >
            AUSTIN'S PLUMBING <br />
            <span className="text-teal italic">EMERGENCIES</span>, <br />
            SOLVED IN 60 MIN.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-sans text-xl md:text-2xl text-steel mb-12 max-w-2xl leading-relaxed font-medium"
          >
            Master plumbing for your home and business. Upfront flat-rate pricing, 2-year warranties, and 22 years of Texas trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 mb-20"
          >
            <motion.a 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="tel:5125550199" 
              className="group bg-copper text-white px-10 py-5 rounded-sm font-sans font-black text-xl transition-all shadow-[8px_8px_0px_rgba(0,229,255,0.2)] flex items-center justify-center gap-3"
            >
              <Phone size={24} className="group-hover:animate-bounce" />
              CALL (512) 555-0199
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="#contact" 
              className="group bg-transparent border-2 border-teal text-white hover:bg-teal/10 px-10 py-5 rounded-sm font-sans font-black text-xl transition-all flex items-center justify-center gap-3"
            >
              BOOK SERVICE
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex text-teal">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-teal" />)}
              </div>
              <span className="text-white font-display font-bold text-lg tracking-tight">4.9/5 Average Rating</span>
              <span className="text-steel text-sm font-medium">From 1,200+ Austin Residents</span>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/10 pl-8">
              <ShieldCheck size={28} className="text-teal" />
              <span className="text-white font-display font-bold text-lg tracking-tight">22 Years Experience</span>
              <span className="text-steel text-sm font-medium">Licensed Master Plumbers</span>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/10 pl-8">
              <Clock size={28} className="text-teal" />
              <span className="text-white font-display font-bold text-lg tracking-tight">60-Min Response</span>
              <span className="text-steel text-sm font-medium">Guaranteed Emergency Arrival</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-steel text-[10px] font-bold uppercase tracking-widest">Scroll to Explore</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-teal to-transparent"
        />
      </motion.div>
    </section>
  );
}
