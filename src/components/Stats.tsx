import { motion } from 'motion/react';

const stats = [
  { value: '14,000+', label: 'Jobs Completed' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '60 Min', label: 'Emergency Response' },
  { value: '22 Yrs', label: 'Serving Austin' },
];

export default function Stats() {
  return (
    <section className="py-24 bg-limestone border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-mono text-5xl md:text-7xl font-bold text-teal mb-4 tracking-tighter">{stat.value}</div>
              <div className="font-sans text-sm uppercase tracking-widest text-slate900 font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
