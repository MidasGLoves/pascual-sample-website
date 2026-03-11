import { useState, FormEvent } from 'react';
import { Droplet, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email');
    
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSubscribed(true);
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-midnight py-16 border-t border-white/10 relative overflow-hidden">
      {/* Subtle Watermark */}
      <div className="absolute -bottom-32 -right-32 opacity-5 pointer-events-none">
        <Droplet size={400} className="text-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-2 text-white font-display font-black text-2xl tracking-tight mb-6">
            <Droplet className="text-teal fill-teal" size={24} />
            IRONFLOW
          </div>
          <p className="font-sans text-steel text-sm leading-relaxed mb-6">
            When Every Drop Counts. Austin's premier plumbing experts, delivering 60-minute emergency response and 2-year warranties.
          </p>
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold tracking-widest">
            LIC #M-39482
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-display font-bold text-white mb-6">Services</h3>
          <ul className="space-y-3 font-sans text-sm text-steel">
            <li><a href="#services" className="hover:text-teal transition-colors">Residential Plumbing</a></li>
            <li><a href="#services" className="hover:text-teal transition-colors">Commercial Plumbing</a></li>
            <li><a href="#contact" className="hover:text-teal transition-colors">24/7 Emergency</a></li>
            <li><a href="#services" className="hover:text-teal transition-colors">Drain Cleaning</a></li>
            <li><a href="#services" className="hover:text-teal transition-colors">Water Heaters</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-display font-bold text-white mb-6">Contact Us</h3>
          <ul className="space-y-4 font-sans text-sm text-steel">
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-teal mt-0.5" />
              <div>
                <a href="tel:5125550199" className="block text-white font-bold hover:text-teal transition-colors">(512) 555-0199</a>
                <span className="text-xs">24/7 Emergency Hotline</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="text-teal mt-0.5" />
              <a href="mailto:service@ironflowplumbing.com" className="hover:text-teal transition-colors">service@ironflowplumbing.com</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-teal mt-0.5" />
              <span>1234 Plumber Way, Suite 100<br/>Austin, TX 78701</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-display font-bold text-white mb-6">Join the Insider</h3>
          <p className="font-sans text-steel text-sm mb-4">
            Get Austin seasonal plumbing alerts (like freeze warnings) and exclusive discounts.
          </p>
          {subscribed ? (
            <div className="bg-teal/10 border border-teal/20 text-teal px-4 py-3 rounded-sm font-sans text-sm font-bold flex items-center gap-2">
              Thanks for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex">
              <input 
                required
                name="email"
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-l-sm w-full focus:outline-none focus:border-teal font-sans text-sm transition-colors"
              />
              <button disabled={loading} type="submit" className="bg-copper hover:bg-copper/90 text-white px-4 py-2 rounded-r-sm font-sans font-bold text-sm transition-colors disabled:opacity-70">
                {loading ? '...' : 'Join'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans text-steel text-xs">
          © {new Date().getFullYear()} IronFlow Plumbing & Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
