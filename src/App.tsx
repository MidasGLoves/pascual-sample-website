/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import Timeline from './components/Timeline';
import Quotes from './components/Quotes';
import Stats from './components/Stats';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-offwhite font-sans selection:bg-crimson selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Timeline />
        <Quotes />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
