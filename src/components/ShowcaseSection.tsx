'use client';

interface ShowcaseProject {
  id: string;
  title: string;
  emoji: string;
  description: string;
  liveUrl: string;
  features: string[];
  promptExcerpt: string;
  highlights: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

interface ShowcaseSectionProps {
  scrollToSection: (sectionId: string) => void;
  signupsEnabled?: boolean;
}

export default function ShowcaseSection({ scrollToSection, signupsEnabled = true }: ShowcaseSectionProps) {
  const promptStructure = {
    title: "Anatomy of an Exemplary Prompt",
    sections: [
      {
        name: "🎯 Core Purpose",
        description: "Clear business objective and user problem",
        example: "Connecting pet owners with trusted sitters through a seamless experience"
      },
      {
        name: "🎨 Visual Identity", 
        description: "Specific design direction and aesthetic",
        example: "Warm earthy tones, whimsical illustrations, friendly typography"
      },
      {
        name: "⚡ Key Features",
        description: "Essential functionality and user flows",
        example: "User profiles, booking system, GPS tracking, payment integration"
      },
      {
        name: "📱 Technical Context",
        description: "Platform requirements and constraints",
        example: "Mobile-first design, beginner-friendly tech stack"
      },
      {
        name: "🌟 Reference Points",
        description: "Existing apps/sites for inspiration",
        example: "Rover's UX but more playful, Airbnb's trust features"
      }
    ]
  };

  const projects: ShowcaseProject[] = [
    {
      id: 'sniff-and-stay',
      title: 'Sniff & Stay',
      emoji: '🐾',
      description: '"Uber for Pet Sitting" - A complete platform with user profiles, booking system, GPS tracking, and payment integration',
      liveUrl: 'https://sniff-and-stay.lovable.app/#',
      features: [
        '10K+ Trusted Sitters',
        'Real-time GPS Tracking',
        'Secure Payments',
        '24/7 Support'
      ],
      promptExcerpt: 'Create an Uber for Pet Sitting with warm earthy tones, whimsical illustrations, friendly typography, and features like user profiles, booking system, GPS tracking...',
      highlights: [
        {
          icon: '⚡',
          title: 'Professional Design',
          description: 'Lovable intelligently adapted the whimsical prompt into a trust-building platform'
        },
        {
          icon: '🚀',
          title: 'Complete Features',
          description: 'User profiles, ratings, messaging, GPS tracking - all production-ready'
        },
        {
          icon: '📱',
          title: 'Mobile Optimized',
          description: 'Responsive design that works perfectly on all devices'
        }
      ]
    }
  ];

  return (
    <>
      {/* Section Divider */}
      <div className="relative my-16">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black px-6 text-purple-400 text-sm font-medium">
            🚀 What's Possible with Lovable
          </span>
        </div>
      </div>

      {/* Showcase Section */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            From Prompt to Production in Minutes
          </h3>
          <p className="text-lg text-gray-300 mb-6">
            See what you'll build at our event - these platforms were created with just detailed prompts
          </p>
        </div>

        {/* Prompt Structure Guide */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 mb-8">
          <h4 className="text-xl font-semibold text-white mb-6 text-center">
            {promptStructure.title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promptStructure.sections.map((section, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <div className="text-purple-300 font-medium text-sm mb-2">
                  {section.name}
                </div>
                <div className="text-gray-300 text-xs mb-3 leading-relaxed">
                  {section.description}
                </div>
                <div className="bg-gray-900/40 rounded p-2 border-l-2 border-green-400/50">
                  <div className="text-green-300 text-xs italic">
                    "{section.example}"
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-lg text-sm">
              <span>💡</span>
              <span>Detailed prompts = Better results. The more specific you are, the closer to your vision!</span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Project Preview */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-white">
                      {project.emoji} {project.title}
                    </h4>
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      View Live Demo →
                    </a>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    {project.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {project.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-green-400">
                        <span className="mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                  <div className="text-purple-300 font-medium text-sm mb-2">💡 From This Prompt:</div>
                  <p className="text-gray-400 text-xs italic leading-relaxed mb-3">
                    "{project.promptExcerpt}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs">✓ Detailed & Specific</span>
                    <button
                      onClick={() => {
                        // Create a modal or expand section to show full prompt
                        alert('Full prompt would be shown here in the workshop!');
                      }}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                    >
                      View Full Prompt →
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Connection */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30">
                  <h4 className="text-xl font-semibold text-white mb-4">
                    🎯 This Could Be Your Project
                  </h4>
                  <div className="space-y-3 text-sm">
                    {project.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-400 mr-2 mt-0.5">{highlight.icon}</span>
                        <div>
                          <div className="text-white font-medium">{highlight.title}</div>
                          <div className="text-gray-300">{highlight.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => scrollToSection('signup')}
                    disabled={!signupsEnabled}
                    className={`w-full btn-primary glow ${!signupsEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{
                      background: signupsEnabled
                        ? 'linear-gradient(to right, #8b5cf6, #3b82f6)'
                        : 'linear-gradient(to right, #6b7280, #6b7280)',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: signupsEnabled ? 'pointer' : 'not-allowed',
                      color: 'white',
                    }}
                  >
                    {signupsEnabled ? '💜 Build Your Vision with Lovable' : '❌ Registration Closed'}
                  </button>
                  <p className="text-purple-300 text-sm mt-2">
                    Learn how at the Vibe Coding Event
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}