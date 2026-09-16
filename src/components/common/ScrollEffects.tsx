import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
  Hook that uses IntersectionObserver to reveal elements as they enter the viewport.
  Target elements should have classes: .reveal-on-scroll, .reveal-scale, .reveal-left, or .reveal-right
 */
export function useScrollReveal(dependency?: any) {
  useEffect(() => {
    const rootContainer = document.getElementById('main-content-scroll');

    const revealElements = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-left, .reveal-right');
      elements.forEach((el) => {
        el.classList.add('is-visible');
      });
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: rootContainer || null,
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.01
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-left, .reveal-right');

    elements.forEach((el) => {
      el.classList.add('is-visible');
      observer.observe(el);
    });

    // Also run a short timeout check to catch dynamically mounted DOM nodes
    const timer = setTimeout(() => {
      revealElements();
    }, 100);

    return () => {
      clearTimeout(timer);
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [dependency]);
}

/**
 * Top fixed Scroll Progress Bar Component
 */
export const ScrollProgressBar: React.FC<{ targetContainerId?: string }> = ({ targetContainerId }) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      let currentScroll = 0;
      let scrollHeight = 0;

      if (targetContainerId) {
        const container = document.getElementById(targetContainerId);
        if (container) {
          currentScroll = container.scrollTop;
          scrollHeight = container.scrollHeight - container.clientHeight;
        }
      } else {
        const main = document.querySelector('main');
        if (main) {
          currentScroll = main.scrollTop;
          scrollHeight = main.scrollHeight - main.clientHeight;
        } else {
          currentScroll = window.scrollY;
          scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        }
      }

      if (scrollHeight > 0) {
        const progress = (currentScroll / scrollHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const container = targetContainerId ? document.getElementById(targetContainerId) : document.querySelector('main');
    const scrollTarget = container || window;

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [targetContainerId]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none bg-slate-900/40 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

/**
 * Floating Back-to-Top Button
 */
export const ScrollToTopButton: React.FC<{ targetContainerId?: string }> = ({ targetContainerId }) => {
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentScroll = 0;

      if (targetContainerId) {
        const container = document.getElementById(targetContainerId);
        if (container) currentScroll = container.scrollTop;
      } else {
        const main = document.querySelector('main');
        if (main) currentScroll = main.scrollTop;
        else currentScroll = window.scrollY;
      }

      setShowButton(currentScroll > 220);
    };

    const container = targetContainerId ? document.getElementById(targetContainerId) : document.querySelector('main');
    const scrollTarget = container || window;

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [targetContainerId]);

  const scrollToTop = () => {
    if (targetContainerId) {
      const container = document.getElementById(targetContainerId);
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl shadow-2xl shadow-cyan-950 backdrop-blur-md transition-all cursor-pointer group hover:scale-110 animate-in fade-in zoom-in-90 duration-200"
      title="Scroll back to top"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
