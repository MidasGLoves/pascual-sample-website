import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-navy">
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-navy/60 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy z-10" />
        <img 
          src="https://images.unsplash.com/photo-1483726234545-481d6e8804cb?q=80&w=3000&auto=format&fit=crop" 
          alt="Washington DC" 
          className="w-full h-full object-cover opacity-50 grayscale"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <div className="relative z-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], staggerChildren: 0.2 }}
          className="font-serif text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-6"
        >
          <motion.span className="block md:inline-block" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>HOPE. </motion.span>
          <motion.span className="block md:inline-block text-gold" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}>ACTION. </motion.span>
          <motion.span className="block md:inline-block" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}>LEGACY.</motion.span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-sans text-sm md:text-base uppercase tracking-[0.3em] text-offwhite/80 mb-12"
        >
          The 44th President of the United States
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="group relative inline-flex items-center gap-4 text-sm uppercase tracking-widest hover:text-gold transition-colors duration-300"
        >
          <span className="w-8 h-[1px] bg-gold group-hover:w-12 transition-all duration-300" />
          Explore the Legacy
          <span className="w-8 h-[1px] bg-gold group-hover:w-12 transition-all duration-300" />
        </motion.button>
      </div>
    </section>
  );
}
