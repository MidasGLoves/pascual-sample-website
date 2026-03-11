import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import ServicesGrid from '../components/ServicesGrid';
import USPs from '../components/USPs';
import Stats from '../components/Stats';
import Reviews from '../components/Reviews';
import MeetMarcus from '../components/MeetMarcus';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';

export default function Landing() {
  return (
    <div className="min-h-screen bg-limestone text-slate900 font-sans selection:bg-teal selection:text-midnight">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <ServicesGrid />
        <USPs />
        <Stats />
        <Reviews />
        <MeetMarcus />
        <Contact />
      </main>
      <Footer />
      <ChatBox />
    </div>
  );
}
