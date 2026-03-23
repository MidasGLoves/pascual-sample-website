import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: "Sarah T.",
    location: "Cedar Park",
    text: "Woke up to a flooded kitchen at 3 AM on a Sunday. Marcus and his team were at my house in Cedar Park in 45 minutes. They found the burst pipe, shut off the main, and had it repiped before the sun came up. Absolute lifesavers.",
    date: "2 weeks ago"
  },
  {
    name: "David R.",
    location: "Round Rock",
    text: "Tired of cold showers. IRONFLOW gave me a flat quote for a tankless system over the phone. No upselling, no BS. The install is so clean it looks like a piece of art on my garage wall.",
    date: "1 month ago"
  },
  {
    name: "Elena M.",
    location: "South Austin",
    text: "Three other plumbers told me I needed my yard dug up for a $10k sewer replacement. IRONFLOW ran a camera, found a localized root intrusion, hydro-jetted it, and fixed it for a fraction of the cost. Honest guys.",
    date: "2 months ago"
  },
  {
    name: "Mark & Lisa",
    location: "Westlake",
    text: "Used them for the plumbing phase of our master bath remodel. Punctual, respectful of our home (wore booties!), and passed city inspection on the first try.",
    date: "3 months ago"
  },
  {
    name: "James B.",
    location: "Pflugerville",
    text: "It's rare to find contractors who actually answer the phone, show up when they say they will, and charge what they quoted. IRONFLOW is my plumber for life now.",
    date: "4 months ago"
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-32 bg-limestone overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight/5 text-midnight font-mono text-[10px] font-black mb-6 tracking-widest uppercase"
            >
              Testimonials
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-black text-slate900 leading-tight tracking-tighter"
            >
              DON'T TAKE OUR WORD FOR IT. <span className="text-teal italic">ASK YOUR NEIGHBORS.</span>
            </motion.h2>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-gold text-gold" />
              ))}
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="font-display font-black text-xl text-slate-900">4.9/5 <span className="text-slate-400 text-sm font-medium uppercase tracking-widest ml-1">Google</span></div>
          </motion.div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient Masks for smooth scroll edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-limestone to-transparent z-10 hidden lg:block" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-limestone to-transparent z-10 hidden lg:block" />

        <div className="flex gap-8 px-6 pb-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="w-[85vw] max-w-[450px] bg-white p-10 rounded-3xl shadow-soft hover:shadow-strong border border-slate-100 snap-center flex-shrink-0 flex flex-col transition-all duration-500 relative"
            >
              <Quote className="absolute top-8 right-8 text-slate-50" size={80} strokeWidth={3} />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-gold text-gold" />
                  ))}
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png" alt="Google" className="h-6" />
              </div>
              
              <p className="font-sans text-slate-700 leading-relaxed mb-10 text-lg font-medium relative z-10 italic">
                "{review.text}"
              </p>
              
              <div className="mt-auto flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-display font-black text-slate-400 text-xl">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-black text-slate-900 text-lg tracking-tight">{review.name}</div>
                  <div className="font-sans text-sm text-slate-400 font-medium">{review.location} • {review.date}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
