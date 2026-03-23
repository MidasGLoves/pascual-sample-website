import { motion } from 'motion/react';
import { Wrench, Flame, Droplets, ArrowRight, Bath, Thermometer, ShieldAlert } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: "Residential Plumbing",
    desc: "Complete home repairs, from leaky faucets to full repipes.",
    color: "bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    icon: Flame,
    title: "Water Heaters",
    desc: "Tank & tankless installation, repair, and maintenance.",
    color: "bg-orange-500/10",
    iconColor: "text-orange-500"
  },
  {
    icon: Droplets,
    title: "Drain Cleaning",
    desc: "Hydro-jetting and rooter services to clear the toughest clogs.",
    color: "bg-teal-500/10",
    iconColor: "text-teal-500"
  },
  {
    icon: ShieldAlert,
    title: "Leak Detection",
    desc: "Non-invasive slab leak and hidden pipe diagnostics.",
    color: "bg-red-500/10",
    iconColor: "text-red-500"
  },
  {
    icon: Bath,
    title: "Fixture Installation",
    desc: "Toilets, faucets, sinks, showers, and luxury tubs.",
    color: "bg-purple-500/10",
    iconColor: "text-purple-500"
  },
  {
    icon: Thermometer,
    title: "Water Filtration",
    desc: "Whole-house softeners and reverse osmosis systems.",
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-500"
  }
];

export default function ServicesGrid() {
  return (
    <section id="services" className="py-32 bg-limestone overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight/5 text-midnight font-mono text-[10px] font-black mb-6 tracking-widest uppercase"
            >
              Our Expertise
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-black text-slate900 leading-tight tracking-tighter"
            >
              PRECISION SOLUTIONS FOR EVERY <span className="text-teal italic">PIPE & DRAIN.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-sans text-xl text-slate-600 max-w-md leading-relaxed font-medium"
          >
            From midnight emergencies to master-planned remodels, our licensed experts handle it all with upfront pricing.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white p-10 rounded-2xl border border-slate-200 shadow-soft hover:shadow-strong transition-all duration-500 flex flex-col h-full"
            >
              <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <service.icon size={32} className={`${service.iconColor}`} strokeWidth={2} />
              </div>
              
              <h3 className="font-display text-2xl font-black text-slate900 mb-4 tracking-tight">{service.title}</h3>
              <p className="font-sans text-slate-600 mb-10 leading-relaxed font-medium flex-grow">{service.desc}</p>
              
              <motion.a 
                href="#contact" 
                className="inline-flex items-center gap-2 text-midnight font-display font-black text-sm uppercase tracking-widest group-hover:text-teal transition-colors mt-auto"
              >
                <span>Book Service</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </motion.a>

              {/* Decorative background element */}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <service.icon size={120} className="text-slate-900" strokeWidth={1} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
