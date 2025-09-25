'use client';

import WebGLBackground from '@/components/WebGLBackground';
import AgendaSection from '@/components/AgendaSection';
import SignupForm from '@/components/SignupForm';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [showSignupForm, setShowSignupForm] = useState(false)

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'signup') {
      setShowSignupForm(true)
      return
    }
    console.log('Scrolling to section:', sectionId);

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

      {/* Compact Hero with Integrated Info */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="text-gradient">VIBE</span>
              <br />
              <span className="text-white">CODING</span>
            </h1>
            <h2 className="text-xl md:text-3xl font-light text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Turn Your Idea Into a Live Vibe — Fast, Fun, and Real.
            </h2>

            {/* Hero CTA */}
            <div className="mb-12">
              <button
                onClick={() => scrollToSection('signup')}
                className="btn-primary btn-large glow"
                style={{
                  background:
                    'linear-gradient(to right, #059669, #10b981)',
                  padding: '1.25rem 3rem',
                  borderRadius: '9999px',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                🚀 Join the Vibe - $10 Only
              </button>
              <p className="text-green-400 text-sm mt-2 font-medium">
                ⏰ Limited to 40 participants
              </p>
            </div>

            {/* Partnership & Organizer - Compact */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
                  className="w-full btn-primary"
                  style={{
                    background:
                      'linear-gradient(to right, #8b5cf6, #3b82f6)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  Reserve Your Spot
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
                  Gourmet meals & premium coffee
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Exclusive swag & merchandise
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Digital certificate & resources
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Industry networking opportunities
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
                className="btn-primary glow"
                style={{
                  background:
                    'linear-gradient(to right, #059669, #10b981)',
                  padding: '1rem 2.5rem',
                  borderRadius: '9999px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                💡 Secure Your Spot - $10
              </button>
              <p className="text-green-400 text-sm mt-3">
                🔥 Early bird pricing • Only 40 spots available
              </p>
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
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-12">
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
          <AgendaSection />

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
                  className="btn-primary btn-large glow"
                  style={{
                    background:
                      'linear-gradient(to right, #059669, #10b981)',
                    padding: '1.25rem 3rem',
                    borderRadius: '9999px',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  Register Now - $10
                </button>
                <div className="text-gray-400 text-sm">
                  Limited to 40 participants
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

      {/* Signup Form Modal */}
      {showSignupForm && (
        <SignupForm onClose={() => setShowSignupForm(false)} />
      )}
    </div>
  );
}
