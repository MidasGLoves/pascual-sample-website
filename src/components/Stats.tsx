import { motion } from 'motion/react';

const stats = [
  { value: '14,000+', label: 'Jobs Completed', suffix: '' },
  { value: '4.9', label: 'Average Rating', suffix: '★' },
  { value: '60', label: 'Response Time', suffix: ' Min' },
  { value: '22', label: 'Years Serving', suffix: ' Yrs' },
];

export default function Stats() {
  return (
    <section className="py-32 bg-midnight relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,229,255,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(217,119,54,0.2),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center group"
            >
              <div className="relative inline-block mb-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 1 }}
                  className="font-display text-6xl md:text-8xl font-black text-white tracking-tighter flex items-baseline justify-center"
                >
                  {stat.value}
                  <span className="text-teal text-3xl md:text-4xl ml-1">{stat.suffix}</span>
                </motion.div>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-teal scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="font-display text-xs md:text-sm uppercase tracking-[0.3em] text-slate-400 font-black"
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
