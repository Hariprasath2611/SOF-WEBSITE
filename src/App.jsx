import React from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HostVenue from './components/HostVenue';
import Participation from './components/Participation';
import EventGrid from './components/EventGrid';
import OverallCoordinators from './components/OverallCoordinators';
import OpenSourceNetwork from './components/OpenSourceNetwork';
import ContributionGraph from './components/ContributionGraph';
import Timeline from './components/Timeline';
import RegistrationCTA from './components/RegistrationCTA';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app-root">
      {/* Dynamic Animated Background Canvas with Git Branches & Code Particles */}
      <BackgroundCanvas />

      {/* Sticky Glassmorphic Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section with Interactive Terminal */}
        <Hero />

        {/* Organizer / Host College & Campus Venue */}
        <HostVenue />

        {/* Who Can Participate? Open to All Engineering Students */}
        <Participation />

        {/* 5 Main Events Explorer & Dedicated Event Coordinators */}
        <EventGrid />

        {/* Open Source Living Ecosystem */}
        <OpenSourceNetwork />

        {/* GitHub-Style Contribution Heatmap */}
        <ContributionGraph />

        {/* 10 Overall Event Coordinators Grid */}
        <OverallCoordinators />

        {/* Event Schedule Timeline */}
        <Timeline />

        {/* High-Converting Registration CTA */}
        <RegistrationCTA />

        {/* Interactive FAQ Accordion */}
        <FAQ />

        {/* Direct Contact & Helpdesk */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
