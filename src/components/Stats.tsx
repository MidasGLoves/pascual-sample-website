import { motion } from 'motion/react';

const stats = [
  { value: '20M+', label: 'Americans Gained Health Coverage' },
  { value: '75', label: 'Months of Consecutive Job Growth' },
  { value: '197', label: 'Nations in Paris Agreement' },
  { value: '1.8M', label: 'Inauguration Attendees' },
];

export default function Stats() {
  return (
    <section className="py-32 bg-alabaster text-navy">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-serif text-6xl md:text-7xl font-bold text-navy mb-4">{stat.value}</div>
              <div className="font-sans text-sm uppercase tracking-widest text-crimson font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
