import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    
    if (!email && !phone) {
      alert('Please provide either an email address or a phone number so we can contact you.');
      return;
    }

    setLoading(true);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-black text-slate900 mb-4"
          >
            Book Your Service in <span className="text-copper">60 Seconds</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans text-lg text-slate-600"
          >
            Fast, reliable, and upfront pricing. Let us know how we can help.
          </motion.p>
        </div>
        
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-limestone border border-teal/30 p-12 rounded-sm text-center shadow-lg"
          >
            <CheckCircle className="text-teal mx-auto mb-6" size={64} />
            <h3 className="font-display text-3xl font-bold text-slate900 mb-4">Request Received!</h3>
            <p className="text-slate-600 text-lg">Our dispatch team is reviewing your request. We will call you within the next 10 minutes to confirm your appointment.</p>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-6 bg-limestone p-8 md:p-10 rounded-sm border border-slate-200 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate900 mb-2">Full Name *</label>
                <input name="name" required type="text" className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate900 mb-2">Service Address *</label>
                <input name="address" required type="text" className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all" placeholder="123 Main St, Austin, TX 78701" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate900 mb-2">Email Address <span className="text-slate-500 font-normal">(Provide Email or Phone)</span></label>
                <input name="email" type="email" className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate900 mb-2">Phone Number <span className="text-slate-500 font-normal">(Provide Phone or Email)</span></label>
                <input name="phone" type="tel" className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all" placeholder="(512) 555-0199" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate900 mb-2">Service Needed *</label>
              <select name="service" className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none bg-white transition-all">
                <option>General Plumbing Repair</option>
                <option>Water Heater Service</option>
                <option>Drain Cleaning</option>
                <option>Leak Detection</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate900 mb-2">Message (Optional)</label>
              <textarea name="message" rows={3} className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all resize-none" placeholder="Briefly describe the issue..."></textarea>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-copper hover:bg-copper/90 text-white px-8 py-4 rounded-sm font-sans font-bold text-lg transition-all shadow-[4px_4px_0px_rgba(217,119,54,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(217,119,54,0.2)] disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Sending...' : 'Request Dispatch'}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
