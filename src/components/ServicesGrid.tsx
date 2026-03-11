import { motion } from 'motion/react';
import { Wrench, Flame, Droplets, ArrowRight, Bath, Thermometer, ShieldAlert } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: "Residential Plumbing",
    desc: "Complete home repairs, from leaky faucets to full repipes."
  },
  {
    icon: Flame,
    title: "Water Heaters",
    desc: "Tank & tankless installation, repair, and maintenance."
  },
  {
    icon: Droplets,
    title: "Drain Cleaning",
    desc: "Hydro-jetting and rooter services to clear the toughest clogs."
  },
  {
    icon: ShieldAlert,
    title: "Leak Detection",
    desc: "Non-invasive slab leak and hidden pipe diagnostics."
  },
  {
    icon: Bath,
    title: "Fixture Installation",
    desc: "Toilets, faucets, sinks, showers, and luxury tubs."
  },
  {
    icon: Thermometer,
    title: "Water Filtration",
    desc: "Whole-house softeners and reverse osmosis systems."
  }
];

export default function ServicesGrid() {
  return (
    <section id="services" className="py-24 bg-limestone">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-black text-slate900 mb-4"
          >
            Precision Solutions for Every Pipe, Drain, and Heater.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans text-lg text-slate-600 max-w-2xl mx-auto"
          >
            From midnight emergencies to master-planned remodels, our licensed experts handle it all with upfront pricing.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-midnight p-8 rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(217,119,54,0.2)] flex flex-col"
            >
              <div className="absolute bottom-0 left-0 w-full h-1 bg-copper scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              
              <service.icon size={40} className="text-teal mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" strokeWidth={1.5} />
              
              <h3 className="font-display text-2xl font-bold text-white mb-3">{service.title}</h3>
              <p className="font-sans text-steel mb-8 leading-relaxed flex-grow">{service.desc}</p>
              
              <a href="#contact" className="inline-flex items-center gap-2 text-teal font-sans font-semibold text-sm group-hover:gap-3 transition-all mt-auto w-fit">
                Book Service <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
