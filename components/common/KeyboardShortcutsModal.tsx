"use client";

import { useState } from "react";
import { X, Keyboard, Command } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any;
}

interface ShortcutDisplay {
  keys: string[];
  description: string;
  category: string;
}

export function KeyboardShortcutsModal({ isOpen, onClose, messages }: KeyboardShortcutsModalProps) {
  // Close modal with Escape key
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "Escape",
        action: onClose,
        description: "Close modal"
      }
    ],
    enabled: isOpen
  });

  if (!isOpen) return null;

  const shortcuts: ShortcutDisplay[] = [
    {
      keys: ["Ctrl", "B"],
      description: messages?.shortcuts?.toggleSidebar || "Toggle sidebar",
      category: "Navigation"
    },
    {
      keys: ["/"],
      description: messages?.shortcuts?.focusSearch || "Focus search",
      category: "Search"
    },
    {
      keys: ["Ctrl", "K"],
      description: messages?.shortcuts?.focusSearchAlt || "Focus search (alternative)",
      category: "Search"
    },
    {
      keys: ["Ctrl", "D"],
      description: messages?.shortcuts?.toggleTheme || "Toggle dark mode",
      category: "Interface"
    },
    {
      keys: ["Ctrl", "H"],
      description: messages?.shortcuts?.goHome || "Go to home page",
      category: "Navigation"
    },
    {
      keys: ["Escape"],
      description: messages?.shortcuts?.closeModal || "Close modals/overlays",
      category: "Interface"
    },
    {
      keys: ["?"],
      description: messages?.shortcuts?.showHelp || "Show keyboard shortcuts",
      category: "Help"
    }
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const renderKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index} className="inline-flex items-center">
        {index > 0 && <span className="mx-1 text-muted">+</span>}
        <kbd className="px-2 py-1 bg-secondary text-foreground text-xs font-medium rounded border border-border shadow-sm">
          {key === "Ctrl" && navigator.platform.includes("Mac") ? "⌘" : key}
        </kbd>
      </span>
    ));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {messages?.shortcuts?.title || "Keyboard Shortcuts"}
                </h2>
                <p className="text-sm text-muted">
                  {messages?.shortcuts?.description || "Speed up your workflow with these shortcuts"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              aria-label="Close shortcuts modal"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {categories.map((category) => (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  {category}
                </h3>
                
                <div className="space-y-3">
                  {shortcuts
                    .filter(shortcut => shortcut.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:bg-secondary/50 transition-colors duration-200"
                      >
                        <span className="text-foreground font-medium">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center space-x-1">
                          {renderKeys(shortcut.keys)}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <p className="text-sm text-muted text-center">
              {messages?.shortcuts?.tip || "Tip: Press"}{" "}
              <kbd className="px-1 py-0.5 bg-background text-foreground text-xs rounded border">?</kbd>{" "}
              {messages?.shortcuts?.tipEnd || "anytime to open this help"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
