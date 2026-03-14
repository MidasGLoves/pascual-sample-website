import { motion } from 'motion/react';
import { Clock, DollarSign, ShieldCheck, MapPin, Users, Leaf } from 'lucide-react';

const usps = [
  {
    icon: Clock,
    title: "60-Minute Emergency Guarantee",
    desc: "If we're not at your door in an hour for an emergency, the dispatch fee is on us."
  },
  {
    icon: DollarSign,
    title: "Upfront Flat-Rate Pricing",
    desc: "No hidden fees, no hourly padding. You approve the exact price before we turn a single wrench."
  },
  {
    icon: ShieldCheck,
    title: "2-Year Labor Warranty",
    desc: "We stand by our craftsmanship. If it leaks, breaks, or fails within 2 years, we fix it free."
  },
  {
    icon: MapPin,
    title: "22+ Years in Austin",
    desc: "We know the local infrastructure, the hard water issues, and the limestone foundations."
  },
  {
    icon: Users,
    title: "Family-Owned & Operated",
    desc: "You're dealing with Marcus and his hand-picked team, not a faceless national franchise."
  },
  {
    icon: Leaf,
    title: "Free Eco-Water Audit",
    desc: "Every service call includes a free inspection to help you lower your Austin Water bill."
  }
];

export default function USPs() {
  return (
    <section className="py-24 bg-midnight relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-5 mix-blend-overlay" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-black text-white mb-4"
          >
            Why Choose IRONFLOW?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans text-lg text-steel max-w-2xl mx-auto"
          >
            We don't just fix pipes; we build trust. Here is our promise to every homeowner in Austin.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usps.map((usp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-sm backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <usp.icon size={24} className="text-teal" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">{usp.title}</h3>
              <p className="font-sans text-steel leading-relaxed">{usp.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
