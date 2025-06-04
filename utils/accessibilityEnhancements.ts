export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private focusTrapStack: HTMLElement[] = [];
  private originalFocus: HTMLElement | null = null;

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  // Focus management
  setFocusTrap(element: HTMLElement): void {
    this.originalFocus = document.activeElement as HTMLElement;
    this.focusTrapStack.push(element);
    this.setupFocusTrap(element);
  }

  removeFocusTrap(): void {
    const element = this.focusTrapStack.pop();
    if (element) {
      this.teardownFocusTrap(element);
    }

    // Restore original focus
    if (this.originalFocus && this.focusTrapStack.length === 0) {
      this.originalFocus.focus();
      this.originalFocus = null;
    }
  }

  private setupFocusTrap(element: HTMLElement): void {
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    element.setAttribute("data-focus-trap", "true");
  }

  private teardownFocusTrap(element: HTMLElement): void {
    element.removeAttribute("data-focus-trap");
    // Remove event listeners would be handled by the component cleanup
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    const elements = container.querySelectorAll(focusableSelectors.join(","));
    return Array.from(elements) as HTMLElement[];
  }

  // Keyboard navigation
  static addKeyboardNavigation(
    element: HTMLElement,
    config: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
    },
  ): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
          config.onEnter?.();
          break;
        case " ":
          e.preventDefault();
          config.onSpace?.();
          break;
        case "Escape":
          config.onEscape?.();
          break;
        case "ArrowUp":
          e.preventDefault();
          config.onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          config.onArrowDown?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          config.onArrowLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          config.onArrowRight?.();
          break;
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    // Return cleanup function
    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }

  // ARIA live regions
  static announceToScreenReader(
    message: string,
    priority: "polite" | "assertive" = "polite",
  ): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.setAttribute("class", "sr-only");
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Color contrast validation
  static validateColorContrast(
    foreground: string,
    background: string,
  ): {
    ratio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  } {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);

    const ratio =
      (Math.max(fgLuminance, bgLuminance) + 0.05) /
      (Math.min(fgLuminance, bgLuminance) + 0.05);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
    };
  }

  private static getLuminance(color: string): number {
    // Simplified luminance calculation
    // In production, use a proper color library
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static hexToRgb(
    hex: string,
  ): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Skip links
  static createSkipLink(targetId: string, label: string): HTMLElement {
    const skipLink = document.createElement("a");
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 rounded";
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });

    return skipLink;
  }

  // Reduced motion detection
  static prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // High contrast mode detection
  static prefersHighContrast(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-contrast: high)").matches;
  }

  // Screen reader detection
  static isScreenReaderActive(): boolean {
    if (typeof window === "undefined") return false;

    // Multiple methods to detect screen readers
    const hasScreenReader = !!(
      (window as any).speechSynthesis ||
      (window as any).navigator?.userAgent?.includes("NVDA") ||
      (window as any).navigator?.userAgent?.includes("JAWS") ||
      (window as any).navigator?.userAgent?.includes("VoiceOver")
    );

    return hasScreenReader;
  }

  // Touch device detection
  static isTouchDevice(): boolean {
    if (typeof window === "undefined") return false;

    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }
}

// React hooks for accessibility
export function useAccessibility() {
  const manager = AccessibilityManager.getInstance();

  return {
    setFocusTrap: manager.setFocusTrap.bind(manager),
    removeFocusTrap: manager.removeFocusTrap.bind(manager),
    announceToScreenReader: AccessibilityManager.announceToScreenReader,
    addKeyboardNavigation: AccessibilityManager.addKeyboardNavigation,
    prefersReducedMotion: AccessibilityManager.prefersReducedMotion(),
    prefersHighContrast: AccessibilityManager.prefersHighContrast(),
    isScreenReaderActive: AccessibilityManager.isScreenReaderActive(),
    isTouchDevice: AccessibilityManager.isTouchDevice(),
  };
}

// ARIA helper functions
export const AriaHelpers = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = "aria"): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA label for complex elements
  createLabel: (element: string, action?: string, state?: string): string => {
    let label = element;
    if (action) label += `, ${action}`;
    if (state) label += `, ${state}`;
    return label;
  },

  // Create ARIA description
  createDescription: (content: string, instructions?: string): string => {
    let description = content;
    if (instructions) description += `. ${instructions}`;
    return description;
  },

  // Format time for screen readers
  formatTimeForScreenReader: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours} hours, ${minutes} minutes, ${remainingSeconds} seconds`;
    } else if (minutes > 0) {
      return `${minutes} minutes, ${remainingSeconds} seconds`;
    } else {
      return `${remainingSeconds} seconds`;
    }
  },

  // Format file size for screen readers
  formatFileSizeForScreenReader: (bytes: number): string => {
    const units = ["bytes", "kilobytes", "megabytes", "gigabytes"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const rounded = Math.round(size * 100) / 100;
    return `${rounded} ${units[unitIndex]}`;
  },
};
