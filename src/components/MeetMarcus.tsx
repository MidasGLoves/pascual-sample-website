import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export default function MeetMarcus() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Image Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="absolute inset-0 bg-teal translate-x-4 translate-y-4 rounded-sm" />
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop" 
            alt="Marcus Delgado - Owner of IronFlow Plumbing" 
            className="relative z-10 w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          
          {/* Floating Badge */}
          <div className="absolute -bottom-6 -right-6 z-20 bg-midnight p-4 rounded-sm shadow-xl flex items-center gap-4">
            <ShieldCheck className="text-teal" size={32} />
            <div>
              <div className="font-display font-bold text-white">Master Plumber</div>
              <div className="font-mono text-xs text-steel">Lic #M-39482</div>
            </div>
          </div>
        </motion.div>
        
        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper font-mono text-xs font-bold mb-6 tracking-wide uppercase">
            Meet The Owner
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl font-black text-slate900 mb-8">
            3 Generations of <br/><span className="text-copper">Texas Plumbing.</span>
          </h2>
          
          <div className="font-sans text-lg text-slate-600 space-y-6 leading-relaxed">
            <p>
              "I didn't just learn plumbing from a textbook; I learned it holding a flashlight for my grandfather when I was ten years old. IronFlow isn't a corporate franchise owned by an investment firm. We are an Austin family business."
            </p>
            <p>
              "We know the limestone soil that shifts your pipes, we know the hard water that eats your heaters, and we know that when water is pouring through your ceiling at 2 AM, you don't want a salesman—you want a master tradesman."
            </p>
            <p className="font-semibold text-slate900">
              "We treat your home exactly how we treat ours: with absolute respect."
            </p>
          </div>

          <div className="mt-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Signature_of_Barack_Obama.svg/1200px-Signature_of_Barack_Obama.svg.png" alt="Signature" className="h-12 opacity-40 mb-2 grayscale" />
            <div className="font-display font-bold text-slate900">Marcus "Iron" Delgado</div>
            <div className="font-sans text-sm text-steel">Founder & Master Plumber</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
