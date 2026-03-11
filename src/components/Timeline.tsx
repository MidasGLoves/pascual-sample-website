import { motion } from 'motion/react';

const events = [
  { year: '2008', title: 'Elected 44th President', desc: 'Barack Obama becomes the first African American president in U.S. history.' },
  { year: '2009', title: 'American Recovery Act', desc: '$787 billion stimulus package signed to combat the Great Recession.' },
  { year: '2010', title: 'Affordable Care Act', desc: 'Landmark healthcare reform expanding coverage to 20 million Americans.' },
  { year: '2011', title: 'Bin Laden Raid', desc: 'Authorizes the successful Navy SEAL operation in Abbottabad.' },
  { year: '2015', title: 'Paris Agreement', desc: 'Leads 197 nations in a historic commitment to combat climate change.' },
];

export default function Timeline() {
  return (
    <section id="the-presidency" className="py-32 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">The Presidency</h2>
          <p className="font-sans text-offwhite/60 uppercase tracking-widest text-sm">2009 — 2017</p>
        </div>

        <div className="relative border-l border-gold/30 ml-4 md:ml-1/2 md:-translate-x-1/2 space-y-24">
          {events.map((event, i) => (
            <motion.div 
              key={event.year}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`relative flex flex-col md:flex-row items-start ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
              
              <div className={`ml-8 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16 md:text-right'}`}>
                <span className="font-quote text-4xl text-gold/50 italic block mb-2">{event.year}</span>
                <h3 className="font-serif text-2xl font-bold mb-3">{event.title}</h3>
                <p className="font-sans text-offwhite/70 leading-relaxed">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
