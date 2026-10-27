import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RoleSelector } from './components/RoleSelector';
import { ChatWorkspace } from './components/ChatWorkspace';
import { VisionLab } from './components/VisionLab';
import { EditorialStudio } from './components/EditorialStudio';
import { CapsuleMatrix } from './components/CapsuleMatrix';
import { FashionCodex } from './components/FashionCodex';
import { SavedLookbookModal } from './components/SavedLookbookModal';
import { FashionRole, ChatMessage, SavedLookbookItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'vision' | 'editorial' | 'capsule' | 'codex'>('editorial');
  const [activeRole, setActiveRole] = useState<FashionRole>('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Persisted chat history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('fashion_copilot_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved messages from localStorage');
    }
    return [];
  });

  // Persisted Lookbook items
  const [savedLookbook, setSavedLookbook] = useState<SavedLookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('fashion_copilot_lookbook');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved lookbook from localStorage');
    }
    return [
      {
        id: 'welcome-seed-1',
        title: 'Archival Reference: Helmut Lang 1998 Sartorial Codes',
        category: 'styling',
        content: `### Helmut Lang 1998 Minimalist Blueprint

**Core Principle:** Pure Reduction without sterility.
- **The Shoulder:** Soft unpadded Italian wool gabardine tailored with high armholes for organic kinetic drape.
- **The Break:** Straight-leg raw denim stacked gently over polished side-zip boots.
- **Tactile Tension:** Crisp technical nylon bonded with raw denim and featherweight poplin shirting.`,
        timestamp: 'Archival Seed',
        tags: ['helmut-lang', '90s-minimalism', 'archival-codes'],
      },
      {
        id: 'welcome-seed-2',
        title: 'Editorial Blueprint: Monolithic Shadows',
        category: 'editorial',
        content: `### 📸 EDITORIAL DIRECTION: MONOLITHIC SHADOWS
**Publication:** Dazed / Self Service
**Lighting:** Low-angle harsh tungsten directional lights against brutalist concrete walls.
**Look 1 (Hero):** Floor-grazing double-breasted charcoal cashmere coat paired with translucent silk organza trousers and chiseled square-toe boots.`,
        timestamp: 'Editorial Seed',
        tags: ['brutalist', 'editorial-direction', 'dazed'],
      }
    ];
  });

  const [isLookbookOpen, setIsLookbookOpen] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('fashion_copilot_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save messages to localStorage');
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('fashion_copilot_lookbook', JSON.stringify(savedLookbook));
    } catch (e) {
      console.warn('Could not save lookbook to localStorage');
    }
  }, [savedLookbook]);

  const handleSaveToLookbook = (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => {
    const newItem: SavedLookbookItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setSavedLookbook((prev) => [newItem, ...prev]);
  };

  const handleDeleteLookbookItem = (id: string) => {
    setSavedLookbook((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearLookbook = () => {
    setSavedLookbook([]);
  };

  // Cross-component seamless jump to chat
  const handleSendToChat = (text: string, image?: string) => {
    setActiveTab('chat');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image,
      expertRole: activeRole,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Trigger AI response directly in chat
    setTimeout(async () => {
      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let base64Payload = image;
        if (image && image.startsWith('http')) {
          const resp = await fetch(image);
          const blob = await resp.blob();
          const reader = new FileReader();
          base64Payload = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }

        const res = await fetch('/api/fashion/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history,
            role: activeRole,
            useSearch: true,
            image: base64Payload,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: data.sources || [],
            expertRole: activeRole,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (err) {
        console.error('Chat auto-send error:', err);
      }
    }, 100);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F8F7F4] text-[#1A1A1A] font-sans antialiased">
      
      {/* Header (Variation 11) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setIsMobileNavOpen(false);
        }}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        savedItemsCount={savedLookbook.length}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />

      {/* Main 3-Column Architectural Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Column 1: Navigation Sidebar (Variation 11 nav-col) */}
        <nav
          className={`
            fixed md:static inset-y-0 left-0 z-40 md:z-10
            w-72 md:w-64 lg:w-[280px] shrink-0
            bg-[#F8F7F4] border-r border-[#1A1A1A]/10
            p-6 md:p-8 flex flex-col justify-between
            transition-transform duration-200 ease-in-out
            ${isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="space-y-8 overflow-y-auto pr-1">
            
            {/* Primary Modes */}
            <div className="nav-group">
              <p className="label mb-3">Primary Modes</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    setIsMobileNavOpen(false);
                  }}
                  className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
                >
                  Intelligence
                </button>
                <button
                  onClick={() => {
                    setActiveTab('vision');
                    setIsMobileNavOpen(false);
                  }}
                  className={`nav-btn ${activeTab === 'vision' ? 'active' : ''}`}
                >
                  Vision Lab
                </button>
                <button
                  onClick={() => {
                    setActiveTab('editorial');
                    setIsMobileNavOpen(false);
                  }}
                  className={`nav-btn ${activeTab === 'editorial' ? 'active' : ''}`}
                >
                  Editorial
                </button>
                <button
                  onClick={() => {
                    setActiveTab('capsule');
                    setIsMobileNavOpen(false);
                  }}
                  className={`nav-btn ${activeTab === 'capsule' ? 'active' : ''}`}
                >
                  Capsule Matrix
                </button>
                <button
                  onClick={() => {
                    setActiveTab('codex');
                    setIsMobileNavOpen(false);
                  }}
                  className={`nav-btn ${activeTab === 'codex' ? 'active' : ''}`}
                >
                  Fashion Codex
                </button>
              </div>
            </div>

            {/* Expert Vectors (Variation 11 Chips) */}
            <RoleSelector activeRole={activeRole} setActiveRole={setActiveRole} />

            {/* Saved Artifacts */}
            <div className="nav-group">
              <p className="label mb-2">Saved Artifacts</p>
              <button
                onClick={() => {
                  setIsLookbookOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="nav-btn italic hover:underline"
              >
                + View Lookbook ({savedLookbook.length})
              </button>
            </div>

          </div>

          {/* Quick Info & Session Status */}
          <div className="pt-6 border-t border-[#1A1A1A]/10 mt-4 shrink-0">
            <div className="flex items-center justify-between text-[#1A1A1A]/60">
              <span className="label text-[0.6rem]">ARCHIVAL STATE</span>
              <span className="label text-[0.6rem] text-[#1A1A1A]">SYNCED</span>
            </div>
            <p className="label text-[0.55rem] mt-1 opacity-70">
              Autumn/Winter 2026/27 Paris &amp; Milan
            </p>
          </div>
        </nav>

        {/* Backdrop for mobile navigation */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Center & Right Columns: Dynamic Studio Workspace */}
        <div className="flex-1 flex overflow-hidden bg-[#F8F7F4]">
          {activeTab === 'editorial' && (
            <EditorialStudio
              onSaveToLookbook={handleSaveToLookbook}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'chat' && (
            <ChatWorkspace
              activeRole={activeRole}
              messages={messages}
              setMessages={setMessages}
              onSaveToLookbook={handleSaveToLookbook}
            />
          )}

          {activeTab === 'vision' && (
            <VisionLab
              onSaveToLookbook={handleSaveToLookbook}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'capsule' && (
            <CapsuleMatrix
              onSaveToLookbook={handleSaveToLookbook}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'codex' && (
            <FashionCodex
              onSendToChat={handleSendToChat}
              onSaveToLookbook={handleSaveToLookbook}
            />
          )}
        </div>

      </div>

      {/* Footer (Variation 11) */}
      <footer className="border-t border-[#1A1A1A]/10 px-6 py-3.5 md:px-8 flex items-center justify-between bg-[#F8F7F4] shrink-0 z-20">
        <div className="label">v4.2.0-STABLE</div>
        <div className="label hidden sm:block">Studio Intelligence: Online</div>
        <div className="label">©2026 Fashion Copilot</div>
      </footer>

      {/* Saved Lookbook Modal */}
      <SavedLookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        items={savedLookbook}
        onDeleteItem={handleDeleteLookbookItem}
        onClearAll={handleClearLookbook}
      />
    </div>
  );
}
