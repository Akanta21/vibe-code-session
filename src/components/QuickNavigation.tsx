'use client';

import { useState, useEffect } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  emoji: string;
}

interface QuickNavigationProps {
  scrollToSection: (sectionId: string) => void;
}

export default function QuickNavigation({
  scrollToSection,
}: QuickNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const navigationItems: NavigationItem[] = [
    { id: 'hero', label: 'Event Info', emoji: '🌟' },
    { id: 'event-details', label: 'Details', emoji: '📅' },
    { id: 'timeline', label: 'Timeline', emoji: '⏰' },
    { id: 'agenda', label: 'Workshop', emoji: '📋' },
    { id: 'showcase', label: 'Examples', emoji: '🚀' },
    { id: 'signup', label: 'Register', emoji: '💫' },
  ];

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 300;

      if (shouldShow && !shouldRender) {
        setShouldRender(true);
        // Small delay to ensure DOM is ready, then trigger fade-in
        setTimeout(() => setIsVisible(true), 10);
      } else if (!shouldShow && isVisible) {
        setIsVisible(false);
        // Wait for fade-out animation to complete before unmounting
        setTimeout(() => setShouldRender(false), 300);
      }

      // Determine active section
      const sections = navigationItems.map((item) => item.id);
      let current = '';

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = sectionId;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isVisible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out text-purple-600 ${
        isMobile
          ? 'bottom-4 left-1/2 transform -translate-x-1/2'
          : 'right-6 top-1/2 transform -translate-y-1/2'
      } ${
        isVisible
          ? 'opacity-100' +
            (isMobile ? ' translate-y-0' : ' translate-x-0')
          : 'opacity-0' +
            (isMobile ? ' translate-y-8' : ' translate-x-8')
      }`}
    >
      <div
        className={`bg-white text-black backdrop-blur-xl border border-purple-500/30 shadow-2xl transform transition-all duration-300 ease-out ${
          isMobile ? 'rounded-full px-2 py-1' : 'rounded-2xl p-3'
        } ${isVisible ? 'scale-100 rotate-0' : 'scale-95 rotate-1'}`}
      >
        <div className={isMobile ? 'flex space-x-1' : 'space-y-2'}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`group flex items-center transition-all duration-300 hover:bg-purple-600/20 ${
                isMobile
                  ? 'justify-center p-2 rounded-full'
                  : 'gap-3 w-full text-left px-3 py-2 rounded-lg'
              } ${
                activeSection === item.id
                  ? isMobile
                    ? 'bg-purple-600/40 text-purple-300 scale-110'
                    : 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-400'
                  : 'text-purple-600 hover:text-purple-600'
              }`}
              title={item.label}
            >
              <span className={isMobile ? 'text-base' : 'text-lg'}>
                {item.emoji}
              </span>
              {!isMobile && (
                <span className="text-sm text-purple-600 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Actions - Only show on desktop */}
        {!isMobile && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-gray-800/50"
              title="Back to top"
            >
              <span>⬆️</span>
              <span className="text-xs">Top</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
