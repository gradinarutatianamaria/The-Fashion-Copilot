import React from 'react';
import { Bookmark, Menu, X } from 'lucide-react';
import { FashionRole } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'vision' | 'editorial' | 'capsule' | 'codex';
  setActiveTab: (tab: 'chat' | 'vision' | 'editorial' | 'capsule' | 'codex') => void;
  activeRole: FashionRole;
  setActiveRole: (role: FashionRole) => void;
  savedItemsCount: number;
  onOpenLookbook: () => void;
  isMobileNavOpen?: boolean;
  setIsMobileNavOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  savedItemsCount,
  onOpenLookbook,
  isMobileNavOpen,
  setIsMobileNavOpen,
}) => {
  const getRoleDisplayName = (role: FashionRole) => {
    switch (role) {
      case 'stylist': return 'Stylist Matrix';
      case 'editor': return 'Runway Editor';
      case 'trend_researcher': return 'Trend Forecaster';
      case 'creative_director': return 'Creative Director';
      case 'brand_strategist': return 'Brand Strategist';
      case 'all_star_panel': return '5-Expert Board';
      default: return 'Omni-Intelligence';
    }
  };

  return (
    <header className="px-6 py-5 md:px-8 md:py-6 border-b-[1.5px] border-[#1A1A1A] flex items-end justify-between bg-[#F8F7F4] shrink-0 z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-baseline gap-4 md:gap-6 flex-wrap">
        <div 
          onClick={() => setActiveTab('editorial')}
          className="flex items-baseline gap-4 cursor-pointer group"
          title="Return to Studio Hub"
        >
          <div className="logo-box transition-transform group-hover:scale-105">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1A1A1A" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#1A1A1A] leading-none">
            FASHION COPILOT
          </h1>
        </div>

        <span className="label hidden sm:inline-block">
          Neural OS 2026 // Studio Intelligence
        </span>
      </div>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] animate-pulse" />
          <span className="label">
            Calibration: {getRoleDisplayName(activeRole)}
          </span>
        </div>

        {/* Lookbook Trigger */}
        <button
          onClick={onOpenLookbook}
          className="flex items-center gap-1.5 label text-[#1A1A1A] hover:opacity-75 transition-opacity px-2.5 py-1 border border-black/10 hover:border-[#1A1A1A] bg-white cursor-pointer"
        >
          <Bookmark className="w-3 h-3 text-[#1A1A1A]" />
          <span>Lookbook</span>
          {savedItemsCount > 0 && (
            <span className="px-1 bg-[#1A1A1A] text-[#F8F7F4] text-[9px] font-mono leading-tight">
              {savedItemsCount}
            </span>
          )}
        </button>

        {/* Mobile Navigation Toggle */}
        {setIsMobileNavOpen && (
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-1 border border-[#1A1A1A] text-[#1A1A1A]"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
};
