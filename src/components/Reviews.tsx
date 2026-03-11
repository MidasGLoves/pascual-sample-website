import { motion } from 'motion/react';
import { Star } from 'lucide-react';

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
    text: "Tired of cold showers. IronFlow gave me a flat quote for a tankless system over the phone. No upselling, no BS. The install is so clean it looks like a piece of art on my garage wall.",
    date: "1 month ago"
  },
  {
    name: "Elena M.",
    location: "South Austin",
    text: "Three other plumbers told me I needed my yard dug up for a $10k sewer replacement. IronFlow ran a camera, found a localized root intrusion, hydro-jetted it, and fixed it for a fraction of the cost. Honest guys.",
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
    text: "It's rare to find contractors who actually answer the phone, show up when they say they will, and charge what they quoted. IronFlow is my plumber for life now.",
    date: "4 months ago"
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-limestone overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-black text-slate900 mb-4"
        >
          Don't Take Our Word For It. <span className="text-copper">Ask Your Neighbors.</span>
        </motion.h2>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient Masks for smooth scroll edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-limestone to-transparent z-10 hidden md:block" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-limestone to-transparent z-10 hidden md:block" />

        <div className="flex gap-6 px-6 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-sm shadow-sm border border-slate-100 snap-center flex-shrink-0"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png" alt="Google" className="h-5" />
              </div>
              <p className="font-sans text-slate-700 leading-relaxed mb-6 italic">"{review.text}"</p>
              <div className="mt-auto">
                <div className="font-display font-bold text-slate900">{review.name}</div>
                <div className="font-sans text-sm text-steel">{review.location} • {review.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
