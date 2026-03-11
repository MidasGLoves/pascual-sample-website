import { motion } from 'motion/react';

export default function Story() {
  return (
    <section id="the-story" className="py-32 bg-alabaster text-navy relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="relative aspect-[3/4] w-full max-w-md mx-auto"
        >
          <div className="absolute inset-0 bg-gold translate-x-4 translate-y-4" />
          <img 
            src="https://images.unsplash.com/photo-1580128660010-fd027e1e587a?q=80&w=2000&auto=format&fit=crop" 
            alt="Barack Obama" 
            className="relative z-10 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-8">The Improbable Journey</h2>
          <div className="font-sans text-lg text-navy/80 space-y-6 leading-relaxed">
            <p>
              From the shores of Honolulu to the South Side of Chicago, Barack Obama's story is a testament to the American Dream. Raised by a single mother and his grandparents, he learned early the values of hard work, empathy, and community.
            </p>
            <p>
              As a community organizer, he witnessed firsthand the struggles of everyday Americans. As a constitutional law professor and state senator, he honed his vision for a more just and equitable society.
            </p>
            <p className="font-quote text-2xl text-crimson italic mt-8 border-l-2 border-gold pl-6">
              "I am from everywhere and nowhere at once."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
