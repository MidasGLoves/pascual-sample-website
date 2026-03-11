import { motion } from 'motion/react';
import { Shield, Award, Droplet, ThumbsUp, Wrench, CheckCircle } from 'lucide-react';

const badges = [
  { icon: Shield, text: "BBB A+ Rated" },
  { icon: Award, text: "Google Guaranteed" },
  { icon: Droplet, text: "EPA WaterSense" },
  { icon: ThumbsUp, text: "Angi Super Service" },
  { icon: Wrench, text: "Lic #M-39482" },
  { icon: CheckCircle, text: "2-Year Warranty" },
];

export default function TrustBar() {
  return (
    <section className="bg-midnight border-y border-white/10 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-3 text-steel"
            >
              <badge.icon size={24} className="text-teal" />
              <span className="font-mono text-sm font-semibold tracking-wide text-white/90">{badge.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
