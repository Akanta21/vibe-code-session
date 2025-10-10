'use client';

import WebGLBackground from '@/components/WebGLBackground';
import AgendaSection from '@/components/AgendaSection';
import ShowcaseSection from '@/components/ShowcaseSection';
import QuickNavigation from '@/components/QuickNavigation';
import SignupForm from '@/components/SignupForm';
import { checkSignupStatus } from '@/lib/signup-status';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [signupMessage, setSignupMessage] = useState<string>('');

  useEffect(() => {
    checkSignupStatus().then((status) => {
      setSignupsEnabled(status.enabled);
      if (status.message) {
        setSignupMessage(status.message);
      }
    });
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'signup') {
      if (signupsEnabled) {
        setShowSignupForm(true);
      } else {
        alert(signupMessage || 'Registration is currently closed.');
      }
      return;
    }

    // Try immediate scroll
    let element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // If not found, try with a small delay
    setTimeout(() => {
      element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        console.error('Element not found after delay:', sectionId);
        // Fallback: try scrolling to approximate position
        const sections = ['about', 'event-details', 'signup'];
        const sectionIndex = sections.indexOf(sectionId);
        if (sectionIndex !== -1) {
          const scrollPosition =
            window.innerHeight * (sectionIndex + 1);
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth',
          });
        }
      }
    }, 100);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        opacity: 0.95,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <WebGLBackground />

      {/* Hero Invitation Card */}
      <main
        id="hero"
        className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Invitation Card Container */}
          <div
            className="invitation-card bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-12 shadow-2xl relative overflow-hidden"
            style={{
              borderImage:
                'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3)) 1',
            }}
          >
            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/50 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/50 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-green-400/50 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/50 rounded-br-lg"></div>

            {/* Invitation Header */}
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-purple-300 uppercase tracking-widest mb-2">
                You're Cordially Invited to
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                <span className="text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                  VIBE
                </span>
                <br />
                <span className="text-white">CODING</span>
              </h1>
              <div className="w-24 h-px bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6"></div>
            </div>

            {/* Event Details in Card Format */}
            <div className="text-center mb-8 space-y-4">
              <h2 className="text-xl md:text-2xl font-light text-gray-200 leading-relaxed italic">
                "Turn Your Idea Into a Live Vibe — Fast, Fun, and
                Real."
              </h2>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <div className="text-purple-400 font-semibold mb-1">
                    📅 Date & Time
                  </div>
                  <div className="text-gray-200">Nov 6, 2025</div>
                  <div className="text-gray-300 text-sm">
                    6:30 PM - 9:00 PM
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <div className="text-blue-400 font-semibold mb-1">
                    📍 Location
                  </div>
                  <div className="text-gray-200 text-sm">
                    182 Cecil St, #35-01
                  </div>
                  <div className="text-gray-300 text-sm">
                    Frasers Tower, Singapore
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Section */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                RSVP Required • Limited to 20 Participants
              </div>
              <button
                onClick={() => scrollToSection('signup')}
                disabled={!signupsEnabled}
                className={`btn-primary btn-large glow ${
                  !signupsEnabled
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  background: signupsEnabled
                    ? 'linear-gradient(to right, #8b5cf6, #3b82f6, #10b981)'
                    : 'linear-gradient(to right, #6b7280, #6b7280)',
                  padding: '1rem 3rem',
                  borderRadius: '2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  cursor: signupsEnabled ? 'pointer' : 'not-allowed',
                  color: 'white',
                  boxShadow: signupsEnabled
                    ? '0 8px 32px rgba(139, 92, 246, 0.3)'
                    : 'none',
                }}
              >
                {signupsEnabled
                  ? '💫 Join the Vibe'
                  : '❌ Registration Closed'}
              </button>
            </div>
          </div>

          {/* Partnership & Organizer - Below Card */}
          <div className="text-center mt-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Organized by
                </span>
                <a
                  href="https://indotech.sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transform hover:scale-105 transition-transform duration-200"
                >
                  <div
                    className="partner-logo flex items-center gap-2"
                    style={{
                      background:
                        'linear-gradient(to right, #FFFFFF, #FFFFFF)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    <Image
                      src="/logo.png"
                      alt="IndoTechSg Logo"
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                </a>
              </div>

              <span className="text-gray-600">•</span>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Sponsored by
                </span>
                <a
                  href="https://cloudflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transform hover:scale-105 transition-transform duration-200"
                >
                  <div
                    className="partner-logo cloudflare"
                    style={{
                      background:
                        'linear-gradient(to right, #3b82f6, #2563eb)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    ☁️ Cloudflare
                  </div>
                </a>
              </div>

              <span className="text-gray-600">•</span>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Powered by
                </span>
                <a
                  href="https://lovable.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transform hover:scale-105 transition-transform duration-200"
                >
                  <div
                    className="partner-logo"
                    style={{
                      background:
                        'linear-gradient(to right, #8b5cf6, #7c3aed)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    💜 Lovable
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-6 text-purple-400 text-sm font-medium">
                ✨ Event Details
              </span>
            </div>
          </div>

          {/* Integrated Event Cards */}
          <div
            id="event-details"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
          >
            {/* Event Info Card */}
            <div className="detail-card expanded">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">📅</span>
                <h3 className="text-xl font-semibold text-white">
                  Event Info
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Date</span>
                  <span className="text-purple-400 font-medium">
                    Nov 6, 2025
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Time</span>
                  <span className="text-purple-400 font-medium">
                    6:30 PM - 9:00 PM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Location</span>
                  <a
                    href="https://share.google/cns9ZnAAZCqpgGR6P"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors cursor-pointer text-right"
                  >
                    📍 182 Cecil St, #35-01 Frasers Tower, Singapore
                    069547
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Spots</span>
                  <span className="text-green-400 font-medium">
                    40 Limited
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => scrollToSection('signup')}
                  disabled={!signupsEnabled}
                  className={`w-full btn-primary ${
                    !signupsEnabled
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                  style={{
                    background: signupsEnabled
                      ? 'linear-gradient(to right, #8b5cf6, #3b82f6)'
                      : 'linear-gradient(to right, #6b7280, #6b7280)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: signupsEnabled
                      ? 'pointer'
                      : 'not-allowed',
                    color: 'white',
                  }}
                >
                  {signupsEnabled ? 'Reserve Your Spot' : 'Closed'}
                </button>
              </div>
            </div>

            {/* What's Included Card */}
            <div className="detail-card">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🎁</span>
                <h3 className="text-xl font-semibold text-white">
                  Included
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Starter pack of vibe coding knowledge
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Individuals with similar goals
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Food & Drinks
                </div>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="detail-card">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">💻</span>
                <h3 className="text-xl font-semibold text-white">
                  Requirements
                </h3>
              </div>
              <div className="space-y-3">
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                  <div className="flex items-center text-green-300 text-sm font-medium mb-2">
                    <span className="mr-2">✅</span>Required
                  </div>
                  <div className="text-gray-300 text-sm">
                    <div>• Your laptop (any OS)</div>
                    <div>• Enthusiasm & curiosity</div>
                  </div>
                </div>
                <div className="text-center text-purple-300 text-sm">
                  <strong>All skill levels welcome!</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-6 text-green-400 text-sm font-medium">
                🚀 Ready to Join?
              </span>
            </div>
          </div>

          {/* Mid-Page CTA */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
              <p className="text-lg text-gray-300 mb-4">
                Ready to turn your idea into reality in just 2.5
                hours?
              </p>
              <button
                onClick={() => scrollToSection('signup')}
                disabled={!signupsEnabled}
                className={`btn-primary glow ${
                  !signupsEnabled
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  background: signupsEnabled
                    ? 'linear-gradient(to right, #059669, #10b981)'
                    : 'linear-gradient(to right, #6b7280, #6b7280)',
                  padding: '1rem 2.5rem',
                  borderRadius: '9999px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: signupsEnabled ? 'pointer' : 'not-allowed',
                  color: 'white',
                }}
              >
                {signupsEnabled
                  ? '💡 Secure Your Spot - $10'
                  : '❌ Registration Closed'}
              </button>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-6 text-blue-400 text-sm font-medium">
                ⏰ Timeline
              </span>
            </div>
          </div>

          {/* Event Timeline */}
          <div
            id="timeline"
            className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-12"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Event Timeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  6:30 PM
                </div>
                <div className="text-2xl mb-2">🌟</div>
                <div className="text-white font-medium text-sm">
                  Kickoff
                </div>
                <div className="text-gray-400 text-xs">
                  Icebreaker
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  6:45 PM
                </div>
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-medium text-sm">
                  Lovable Demo
                </div>
                <div className="text-gray-400 text-xs">
                  Live Build
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  7:05 PM
                </div>
                <div className="text-2xl mb-2">👥</div>
                <div className="text-white font-medium text-sm">
                  Team Up
                </div>
                <div className="text-gray-400 text-xs">Groups</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  7:15 PM
                </div>
                <div className="text-2xl mb-2">🔨</div>
                <div className="text-white font-medium text-sm">
                  Build
                </div>
                <div className="text-gray-400 text-xs">Prototype</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  8:00 PM
                </div>
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-white font-medium text-sm">
                  Deploy
                </div>
                <div className="text-gray-400 text-xs">Go Live</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  8:15 PM
                </div>
                <div className="text-2xl mb-2">🎬</div>
                <div className="text-white font-medium text-sm">
                  Showcase
                </div>
                <div className="text-gray-400 text-xs">Present</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  8:45 PM
                </div>
                <div className="text-2xl mb-2">🎤</div>
                <div className="text-white font-medium text-sm">
                  Wrap-Up
                </div>
                <div className="text-gray-400 text-xs">Share</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-lg font-medium">
                  9:00 PM
                </div>
                <div className="text-2xl mb-2">👋</div>
                <div className="text-white font-medium text-sm">
                  Out of the Lab
                </div>
                <div className="text-gray-400 text-xs">Home</div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-6 text-purple-400 text-sm font-medium">
                📋 Workshop Details
              </span>
            </div>
          </div>

          {/* Agenda Section */}
          <div id="agenda">
            <AgendaSection />
          </div>

          {/* Showcase Section */}
          <div id="showcase">
            <ShowcaseSection
              scrollToSection={scrollToSection}
              signupsEnabled={signupsEnabled}
            />
          </div>

          {/* Section Divider */}
          <div className="relative my-20">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-8 text-green-400 text-lg font-semibold glow">
                🎯 Final Call
              </span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center" id="signup">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Join the Vibe?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Secure your spot for just{' '}
                <strong className="text-green-400 text-2xl">
                  $10
                </strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => scrollToSection('signup')}
                  disabled={!signupsEnabled}
                  className={`btn-primary btn-large glow ${
                    !signupsEnabled
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                  style={{
                    background: signupsEnabled
                      ? 'linear-gradient(to right, #059669, #10b981)'
                      : 'linear-gradient(to right, #6b7280, #6b7280)',
                    padding: '1.25rem 3rem',
                    borderRadius: '9999px',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: signupsEnabled
                      ? 'pointer'
                      : 'not-allowed',
                    color: 'white',
                  }}
                >
                  {signupsEnabled
                    ? 'Register Now - $10'
                    : '❌ Registration Closed'}
                </button>
                <div
                  className={`text-sm ${
                    signupsEnabled ? 'text-gray-400' : 'text-red-400'
                  }`}
                >
                  {signupsEnabled
                    ? 'Limited to 20 participants'
                    : signupMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Vibe Coding Event. Organized by{' '}
            <a
              href="https://indotech.sg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="IndoTechSg Logo"
                width={80}
                height={20}
                className="h-5 w-auto"
              />
            </a>{' '}
            • Sponsored by{' '}
            <span className="text-blue-400">
              Cloudflare Singapore
            </span>{' '}
            • Powered by{' '}
            <span className="text-purple-400">Lovable</span>.
          </p>
        </div>
      </footer>

      {/* Quick Navigation */}
      <QuickNavigation
        scrollToSection={scrollToSection}
        signupsEnabled={signupsEnabled}
      />

      {/* Signup Form Modal */}
      {showSignupForm && (
        <SignupForm onClose={() => setShowSignupForm(false)} />
      )}
    </div>
  );
}
