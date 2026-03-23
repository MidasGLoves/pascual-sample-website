import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Send, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    
    if (!email && !phone) {
      setError('Please provide either an email address or a phone number.');
      return;
    }

    setLoading(true);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit request');
      }
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'There was an error submitting your request. Please try again or call us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.05),transparent_40%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,54,0.05),transparent_40%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Column: Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight/5 text-midnight font-mono text-[10px] font-black mb-6 tracking-widest uppercase"
            >
              Get in Touch
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-black text-slate900 mb-8 leading-tight tracking-tighter"
            >
              BOOK YOUR SERVICE IN <span className="text-teal italic">60 SECONDS.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-sans text-xl text-slate-600 mb-12 leading-relaxed font-medium max-w-lg"
            >
              Fast, reliable, and upfront pricing. Our dispatch team is standing by to handle your plumbing needs.
            </motion.p>

            <div className="space-y-8">
              {[
                { icon: Phone, title: "Emergency Line", detail: "(512) 555-0199", color: "text-red-500" },
                { icon: MapPin, title: "Service Area", detail: "Austin, TX & Surrounding Areas", color: "text-teal" },
                { icon: Clock, title: "Availability", detail: "24/7 Emergency Service Available", color: "text-orange-500" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className={item.color} size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-400 mb-1">{item.title}</h4>
                    <p className="font-display font-black text-xl text-slate-900 tracking-tight">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="bg-white border-2 border-teal p-12 rounded-3xl text-center shadow-strong relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-teal" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle className="text-teal mx-auto mb-8" size={80} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display text-4xl font-black text-slate900 mb-6 tracking-tighter">REQUEST RECEIVED!</h3>
                  <p className="font-sans text-slate-600 text-lg leading-relaxed font-medium mb-8">
                    Our dispatch team is reviewing your request. We will call you within the next <span className="text-teal font-black">10 minutes</span> to confirm your appointment.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-slate-400 hover:text-slate-900 font-display font-black text-xs uppercase tracking-widest transition-colors"
                  >
                    Send another request
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  onSubmit={handleSubmit} 
                  className="bg-white p-10 md:p-12 rounded-3xl border border-slate-200 shadow-strong space-y-8 relative"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-midnight rounded-t-3xl" />
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                    >
                      <AlertTriangle size={18} />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                      <input name="name" required type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Service Address *</label>
                      <input name="address" required type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900" placeholder="123 Main St, Austin, TX" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input name="email" type="email" className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input name="phone" type="tel" className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900" placeholder="(512) 555-0199" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Service Needed *</label>
                    <select name="service" className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900 appearance-none cursor-pointer">
                      <option>General Plumbing Repair</option>
                      <option>Water Heater Service</option>
                      <option>Drain Cleaning</option>
                      <option>Leak Detection</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Message (Optional)</label>
                    <textarea name="message" rows={3} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal focus:bg-white outline-none transition-all font-sans font-semibold text-slate-900 resize-none" placeholder="Briefly describe the issue..."></textarea>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    type="submit" 
                    className="w-full bg-midnight text-white px-8 py-5 rounded-2xl font-display font-black text-sm uppercase tracking-widest transition-all shadow-strong flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Request Dispatch</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
