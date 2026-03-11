import { motion } from 'motion/react';

export default function Quotes() {
  return (
    <section className="py-40 bg-navy relative overflow-hidden flex items-center justify-center min-h-[80vh]">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,_transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
        >
          "YES WE <span className="text-gold">CAN.</span>"
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 font-sans text-offwhite/60 uppercase tracking-[0.2em] text-sm"
        >
          New Hampshire Primary Speech, 2008
        </motion.p>
      </div>
    </section>
  );
}
