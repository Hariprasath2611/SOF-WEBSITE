import React, { useState, useEffect } from 'react';
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
import RegistrationPage from './pages/RegistrationPage';
import AdminDashboard from './components/admin/AdminDashboard';

// Import newly created styles
import './styles/registration.css';
import './styles/admin.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'register' | 'admin'
  const [preselectedTrack, setPreselectedTrack] = useState(null);

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();

      if (path === '/admin' || hash.startsWith('#admin')) {
        setCurrentView('admin');
        window.scrollTo(0, 0);
      } else if (path === '/register' || hash.startsWith('#register')) {
        const searchSource = hash.includes('?') ? hash.split('?')[1] : window.location.search;
        const urlParams = new URLSearchParams(searchSource);
        const track = urlParams.get('track');
        if (track) setPreselectedTrack(track);
        setCurrentView('register');
        window.scrollTo(0, 0);
      } else {
        setCurrentView('home');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

    // Custom event for smooth programmatic registration triggering
    const handleCustomOpen = (e) => {
      if (e.detail && e.detail.track) {
        setPreselectedTrack(e.detail.track);
      }
      window.location.hash = '#register';
    };
    window.addEventListener('open-registration', handleCustomOpen);

    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('open-registration', handleCustomOpen);
    };
  }, []);

  const navigateToHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.location.hash = '';
    setCurrentView('home');
    setPreselectedTrack(null);
  };

  // 1. Full-screen Custom Registration View
  if (currentView === 'register') {
    return (
      <div className="app-root">
        <BackgroundCanvas />
        <RegistrationPage onBackToHome={navigateToHome} preselectedTrack={preselectedTrack} />
      </div>
    );
  }

  // 2. Full-screen Admin Dashboard View
  if (currentView === 'admin') {
    return (
      <div className="app-root">
        <BackgroundCanvas />
        <AdminDashboard onBackToHome={navigateToHome} />
      </div>
    );
  }

  // 3. Main Event Website
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
