"use client";

import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === !!event.ctrlKey &&
          !!shortcut.shiftKey === !!event.shiftKey &&
          !!shortcut.altKey === !!event.altKey &&
          !!shortcut.metaKey === !!event.metaKey
        );
      });

      if (matchingShortcut) {
        // Don't trigger shortcuts when user is typing in an input
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' || 
                        activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isTyping) {
          event.preventDefault();
          matchingShortcut.action();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

// Common keyboard shortcuts for the application
export const createCommonShortcuts = (actions: {
  toggleSidebar?: () => void;
  focusSearch?: () => void;
  toggleTheme?: () => void;
  goHome?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.toggleSidebar) {
    shortcuts.push({
      key: "b",
      ctrlKey: true,
      action: actions.toggleSidebar,
      description: "Toggle sidebar"
    });
  }

  if (actions.focusSearch) {
    shortcuts.push({
      key: "/",
      action: actions.focusSearch,
      description: "Focus search"
    });
    shortcuts.push({
      key: "k",
      ctrlKey: true,
      action: actions.focusSearch,
      description: "Focus search"
    });
  }

  if (actions.toggleTheme) {
    shortcuts.push({
      key: "d",
      ctrlKey: true,
      action: actions.toggleTheme,
      description: "Toggle dark mode"
    });
  }

  if (actions.goHome) {
    shortcuts.push({
      key: "h",
      ctrlKey: true,
      action: actions.goHome,
      description: "Go to home page"
    });
  }

  return shortcuts;
};
