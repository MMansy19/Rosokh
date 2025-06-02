

To create a responsive UI design guide for the **Rosokh** Islamic multimedia platform, I'll outline a comprehensive set of guidelines that align with the modern, green-tosca geometric aesthetic implied by the "Green Tosca Modern Geometric Web Hosting Service Presentation" reference. The design will prioritize mobile-first responsiveness, support both dark and light modes, and cater to the platform's trilingual (Arabic, English, Russian) and Islamic-focused features (Quran reader, audio player, memorization games, Khatma tracker, calendar, analytics, and contact form). The guide will include typography, color schemes, layout principles, component styles, and accessibility considerations, ensuring high performance and a user-friendly experience across devices.

Below is the design guide, wrapped in an `<xaiArtifact>` tag as a JSON file for easy integration into your development workflow. The structure is designed to be actionable for developers using a framework like Next.js with Tailwind CSS, as implied by the blueprint's tech stack.

---

```json
{
  "overview": {
    "description": "The Rosokh UI design guide defines a modern, green-tosca geometric aesthetic for an Islamic multimedia platform. It emphasizes mobile-first responsiveness, dark and light mode support, and accessibility for Arabic, English, and Russian users. The design ensures high performance with minimal dependencies, aligning with the platform's goal of providing a free, seamless experience for Quran reading, audio recitations, memorization games, Khatma tracking, Islamic calendar, analytics, and contact features.",
    "goals": [
      "Create a visually appealing, Islamic-inspired interface with green-tosca tones.",
      "Ensure responsiveness across mobile, tablet, and desktop devices.",
      "Support dark and light modes for user comfort and accessibility.",
      "Maintain performance with lightweight assets and optimized layouts.",
      "Cater to trilingual users with RTL (Arabic) and LTR (English, Russian) support."
    ]
  },
  "color_scheme": {
    "light_mode": {
      "primary": {
        "name": "Tosca Green",
        "hex": "#2E8B57",
        "usage": "Primary buttons, headers, and accents"
      },
      "secondary": {
        "name": "Soft White",
        "hex": "#F5F6F5",
        "usage": "Backgrounds, cards, and main content areas"
      },
      "accent": {
        "name": "Golden Sand",
        "hex": "#DAA520",
        "usage": "Highlights, icons, and call-to-action elements"
      },
      "text": {
        "primary": {
          "hex": "#1A2525",
          "usage": "Main text, headings"
        },
        "secondary": {
          "hex": "#4A5E5E",
          "usage": "Subtext, labels, and secondary information"
        }
      },
      "error": {
        "hex": "#B22222",
        "usage": "Error messages and alerts"
      },
      "success": {
        "hex": "#228B22",
        "usage": "Success messages and confirmations"
      }
    },
    "dark_mode": {
      "primary": {
        "name": "Tosca Green Dark",
        "hex": "#3CB371",
        "usage": "Primary buttons, headers, and accents"
      },
      "secondary": {
        "name": "Dark Slate",
        "hex": "#1C2526",
        "usage": "Backgrounds, cards, and main content areas"
      },
      "accent": {
        "name": "Golden Sand Light",
        "hex": "#E0B450",
        "usage": "Highlights, icons, and call-to-action elements"
      },
      "text": {
        "primary": {
          "hex": "#E8ECEF",
          "usage": "Main text, headings"
        },
        "secondary": {
          "hex": "#A0A6A6",
          "usage": "Subtext, labels, and secondary information"
        }
      },
      "error": {
        "hex": "#FF4040",
        "usage": "Error messages and alerts"
      },
      "success": {
        "hex": "#32CD32",
        "usage": "Success messages and confirmations"
      }
    }
  },
  "typography": {
    "fonts": {
      "arabic": {
        "name": "Amiri",
        "source": "Google Fonts or local hosting",
        "usage": "Quran text, Arabic UI elements",
        "weights": ["400", "700"],
        "fallback": "Noto Naskh Arabic"
      },
      "latin": {
        "name": "Inter",
        "source": "Google Fonts or local hosting",
        "usage": "English and Russian text, general UI",
        "weights": ["400", "500", "600", "700"],
        "fallback": "sans-serif"
      }
    },
    "sizes": {
      "h1": {
        "size": "2.5rem",
        "mobile": "1.875rem",
        "line_height": "1.2",
        "weight": "700",
        "usage": "Page titles"
      },
      "h2": {
        "size": "1.875rem",
        "mobile": "1.5rem",
        "line_height": "1.3",
        "weight": "600",
        "usage": "Section headers"
      },
      "body": {
        "size": "1rem",
        "mobile": "0.9375rem",
        "line_height": "1.5",
        "weight": "400",
        "usage": "Paragraphs, general text"
      },
      "small": {
        "size": "0.875rem",
        "mobile": "0.8125rem",
        "line_height": "1.5",
        "weight": "400",
        "usage": "Footnotes, captions, secondary text"
      },
      "quran": {
        "size": "1.25rem",
        "mobile": "1.125rem",
        "line_height": "2",
        "weight": "400",
        "font": "Amiri",
        "usage": "Quran verses"
      }
    },
    "direction": {
      "arabic": "rtl",
      "english_russian": "ltr"
    }
  },
  "layout": {
    "grid_system": {
      "columns": 12,
      "gutter": "1.5rem",
      "mobile_gutter": "1rem",
      "max_width": "1280px",
      "padding": {
        "desktop": "2rem",
        "tablet": "1.5rem",
        "mobile": "1rem"
      }
    },
    "breakpoints": {
      "mobile": "0px - 639px",
      "tablet": "640px - 1023px",
      "desktop": "1024px and above"
    },
    "mobile_first": {
      "description": "Design starts with mobile layouts, scaling up to tablet and desktop. Use fluid typography and relative units (%, vw, vh, rem, em) for responsiveness.",
      "stacking": "Components stack vertically on mobile, with single-column layouts. On tablet/desktop, use multi-column grids where appropriate."
    }
  },
  "components": {
    "navigation": {
      "style": {
        "type": "Top bar (desktop), Hamburger menu (mobile)",
        "background": "color_scheme.light_mode.secondary (light), color_scheme.dark_mode.secondary (dark)",
        "text_color": "color_scheme.light_mode.text.primary (light), color_scheme.dark_mode.text.primary (dark)",
        "active_state": "color_scheme.light_mode.accent (light), color_scheme.dark_mode.accent (dark)",
        "padding": "1rem (mobile), 1.5rem (desktop)",
        "shadow": "0 2px 4px rgba(0,0,0,0.1) (light), 0 2px 4px rgba(0,0,0,0.3) (dark)"
      },
      "mobile_menu": {
        "trigger": "Hamburger icon (top-right)",
        "animation": "Slide-in from right (RTL: left)",
        "background": "color_scheme.light_mode.secondary (light), color_scheme.dark_mode.secondary (dark)"
      }
    },
    "buttons": {
      "primary": {
        "background": "color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "text_color": "#FFFFFF",
        "padding": "0.75rem 1.5rem",
        "border_radius": "0.5rem",
        "hover": "Lighten background by 10%",
        "font_size": "1rem",
        "font_weight": "600"
      },
      "secondary": {
        "background": "transparent",
        "border": "2px solid color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "text_color": "color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "padding": "0.75rem 1.5rem",
        "border_radius": "0.5rem",
        "hover": "Fill with primary color, white text",
        "font_size": "1rem",
        "font_weight": "600"
      }
    },
    "cards": {
      "background": "color_scheme.light_mode.secondary (light), color_scheme.dark_mode.secondary (dark)",
      "border_radius": "0.75rem",
      "padding": "1.5rem",
      "shadow": "0 4px 6px rgba(0,0,0,0.1) (light), 0 4px 6px rgba(0,0,0,0.3) (dark)",
      "margin": "1rem",
      "text_color": "color_scheme.light_mode.text.primary (light), color_scheme.dark_mode.text.primary (dark)"
    },
    "quran_reader": {
      "layout": {
        "mobile": "Single-column, verse-by-verse with controls at top",
        "desktop": "Two-column (verse on left, translation/transliteration on right for LTR; reverse for RTL)",
        "controls": "Dropdown for chapter selection, sliders for font size and audio speed, toggle for translation/transliteration"
      },
      "verse_style": {
        "font": "typography.fonts.arabic for Arabic, typography.fonts.latin for translations",
        "background": "color_scheme.light_mode.secondary (light), color_scheme.dark_mode.secondary (dark)",
        "padding": "1rem",
        "border_bottom": "1px solid color_scheme.light_mode.text.secondary (light), color_scheme.dark_mode.text.secondary (dark)",
        "bismillah": "Center-aligned, typography.quran.size * 1.2, color_scheme.light_mode.accent (light), color_scheme.dark_mode.accent (dark)"
      }
    },
    "audio_player": {
      "layout": "Horizontal player with play/pause, speed control, and download button",
      "controls": {
        "play_pause": "Circular button, 2.5rem diameter, color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "speed": "Dropdown or slider, 0.5x to 2x",
        "download": "Icon button, color_scheme.light_mode.accent (light), color_scheme.dark_mode.accent (dark)"
      },
      "progress_bar": {
        "color": "color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "background": "color_scheme.light_mode.text.secondary (light), color_scheme.dark_mode.text.secondary (dark)"
      }
    },
    "memorization_games": {
      "layout": {
        "mobile": "Single-column, full-screen game area",
        "desktop": "Centered game area with max-width 800px",
        "controls": "Large buttons for start, submit, and next question"
      },
      "styles": {
        "question": "typography.h2, centered",
        "options": "Grid layout (2x2 on mobile, 4x1 on desktop), buttons with color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "feedback": "color_scheme.light_mode.success (correct), color_scheme.light_mode.error (incorrect) for light mode; same for dark mode"
      }
    },
    "khatma_tracker": {
      "layout": {
        "mobile": "Stacked cards for progress, streak, and plan",
        "desktop": "Grid with progress bar, stats, and chapter list"
      },
      "progress_bar": {
        "color": "color_scheme.light_mode.primary (light), color_scheme.dark_mode.primary (dark)",
        "background": "color_scheme.light_mode.text.secondary (light), color_scheme.dark_mode.text.secondary (dark)"
      },
      "stats": {
        "font": "typography.body",
        "color": "color_scheme.light_mode.text.primary (light), color_scheme.dark_mode.text.primary (dark)"
      }
    },
    "calendar": {
      "layout": {
        "mobile": "Single-column, calendar above prayer times",
        "desktop": "Side-by-side calendar and prayer times"
      },
      "styles": {
        "calendar": "Grid-based, color_scheme.light_mode.accent for holidays",
        "prayer_times": "List with color_scheme.light_mode.primary for next prayer"
      }
    },
    "analytics": {
      "layout": {
        "mobile": "Stacked charts and stats",
        "desktop": "Grid with charts (bar, line) and top content list"
      },
      "charts": {
        "colors": "[color_scheme.light_mode.primary, color_scheme.light_mode.accent] (light), [color_scheme.dark_mode.primary, color_scheme.dark_mode.accent] (dark)"
      }
    },
    "contact_form": {
      "layout": "Centered form with name, email, message fields, and submit button",
      "styles": {
        "inputs": {
          "border": "1px solid color_scheme.light_mode.text.secondary (light), color_scheme.dark_mode.text.secondary (dark)",
          "background": "color_scheme.light_mode.secondary (light), color_scheme.dark_mode.secondary (dark)",
          "padding": "0.75rem",
          "border_radius": "0.5rem"
        },
        "submit": "components.buttons.primary"
      }
    }
  },
  "theme_toggle": {
    "icon": "Sun (light mode), Moon (dark mode)",
    "position": "Top-right corner of navigation bar",
    "style": {
      "background": "color_scheme.light_mode.accent (light), color_scheme.dark_mode.accent (dark)",
      "size": "2rem",
      "border_radius": "50%",
      "padding": "0.5rem"
    }
  },
  "accessibility": {
    "contrast": "Ensure WCAG 2.1 AA compliance (contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text)",
    "keyboard_navigation": "Support tab navigation for all interactive elements",
    "aria_labels": "Use ARIA labels for Quran reader, audio controls, and games",
    "text_scaling": "Support browser font size scaling up to 200%",
    "rtl_ltr": "Handle RTL for Arabic (text-align: right, flex-direction: row-reverse) and LTR for English/Russian"
  },
  "performance": {
    "image_optimization": "Use WebP format, lazy-load images, max size 100KB",
    "font_loading": "Preload Amiri and Inter fonts, use font-display: swap",
    "css": "Use Tailwind CSS for minimal bundle size, purge unused styles",
    "js": "Minimize JS with vanilla or lightweight libraries, defer non-critical scripts"
  },
  "sample_tailwind_config": {
    "description": "Tailwind CSS configuration for Rosokh",
    "config": {
      "theme": {
        "extend": {
          "colors": {
            "tosca-green": {
              "light": "#2E8B57",
              "dark": "#3CB371"
            },
            "soft-white": "#F5F6F5",
            "dark-slate": "#1C2526",
            "golden-sand": {
              "light": "#DAA520",
              "dark": "#E0B450"
            },
            "text-primary": {
              "light": "#1A2525",
              "dark": "#E8ECEF"
            },
            "text-secondary": {
              "light": "#4A5E5E",
              "dark": "#A0A6A6"
            },
            "error": {
              "light": "#B22222",
              "dark": "#FF4040"
            },
            "success": {
              "light": "#228B22",
              "dark": "#32CD32"
            }
          },
          "fontFamily": {
            "amiri": ["Amiri", "Noto Naskh Arabic", "sans-serif"],
            "inter": ["Inter", "sans-serif"]
          }
        }
      }
    }
  }
}
```

---

### Design Guide Overview

#### 1. **Color Scheme**
- **Light Mode**: Uses Tosca Green (#2E8B57) for primary elements, Soft White (#F5F6F5) for backgrounds, and Golden Sand (#DAA520) for accents, evoking Islamic tranquility and modernity.
- **Dark Mode**: Adjusts to Tosca Green Dark (#3CB371), Dark Slate (#1C2526) for backgrounds, and Golden Sand Light (#E0B450) for accents, ensuring readability and comfort in low-light conditions.
- **Purpose**: The green-tosca palette reflects Islamic aesthetics (green symbolizing paradise), while gold adds warmth and highlights interactive elements.

#### 2. **Typography**
- **Arabic**: Uses Amiri for Quran text and UI elements, with Noto Naskh Arabic as a fallback for robust Arabic rendering.
- **English/Russian**: Uses Inter for clean, modern readability, with multiple weights for hierarchy.
- **Sizes**: Fluid typography scales for mobile (smaller sizes) and desktop (larger sizes), with generous line heights for readability, especially for Quranic text.
- **RTL/LTR**: Arabic text uses RTL with right-aligned layouts, while English and Russian use LTR.

#### 3. **Layout**
- **Mobile-First**: Single-column layouts for mobile, stacking components vertically. Tablet and desktop use multi-column grids (12-column system) for efficient space usage.
- **Breakpoints**: Mobile (0-639px), Tablet (640-1023px), Desktop (1024px+).
- **Max Width**: 1280px for desktop to maintain readability and avoid overly wide content.

#### 4. **Components**
- **Navigation**: Top bar on desktop, hamburger menu on mobile with slide-in animation. Supports RTL for Arabic.
- **Buttons**: Primary buttons use Tosca Green with white text; secondary buttons are outlined with hover effects.
- **Cards**: Used for features, Quran verses, and stats, with subtle shadows and rounded corners for a geometric look.
- **Quran Reader**: Displays verses in a clean, readable format with controls for chapter selection, font size, and audio playback.
- **Audio Player**: Compact horizontal player with progress bar and speed controls, optimized for mobile.
- **Memorization Games**: Interactive, grid-based layouts for questions, with clear feedback (correct/incorrect).
- **Khatma Tracker**: Progress bars and stats cards for tracking Quran reading progress.
- **Calendar**: Displays Hijri dates and prayer times, with a focus on the next prayer.
- **Analytics**: Charts (bar/line) and lists for engagement metrics, responsive for mobile stacking.
- **Contact Form**: Simple, centered form with validation feedback.

#### 5. **Theme Toggle**
- **Location**: Top-right in navigation bar, using sun/moon icons.
- **Behavior**: Toggles between light and dark modes, storing preference in local storage.

#### 6. **Accessibility**
- **Contrast**: Meets WCAG 2.1 AA standards for readability.
- **Keyboard Navigation**: All interactive elements (buttons, links, form inputs) are keyboard-accessible.
- **ARIA Labels**: Added for Quran reader, audio controls, and games to support screen readers.
- **RTL/LTR Support**: Seamlessly switches layout direction based on language.

#### 7. **Performance**
- **Images**: Use WebP, lazy-load, and keep sizes under 100KB.
- **Fonts**: Preload Amiri and Inter, use `font-display: swap` to avoid layout shifts.
- **CSS/JS**: Leverage Tailwind CSS for minimal bundle size, defer non-critical JS.

#### 8. **Sample Tailwind Config**
- The provided `sample_tailwind_config` can be copied into `tailwind.config.js` to apply the color scheme and fonts consistently across the app.

### Implementation Notes
- **Tech Stack**: Use Next.js with Tailwind CSS for styling, as implied by the blueprint’s `next-intl` and Vercel references. Integrate the previously provided `ar.json`, `en.json`, and `ru.json` files for translations.
- **RTL Support**: Use Tailwind’s `dir="rtl"` for Arabic pages and adjust flexbox/grid directions (e.g., `flex-row-reverse`).
- **Dark Mode**: Implement with Tailwind’s `dark:` prefix (e.g., `dark:bg-dark-slate`) and a theme toggle hook in Next.js.
- **Example Component** (Quran Reader):
  ```jsx
  import { useTranslations } from 'next-intl';
  function QuranReader() {
    const t = useTranslations('quran_reader');
    return (
      <div className="bg-soft-white dark:bg-dark-slate p-4 rounded-lg">
        <h1 className="text-2xl font-amiri">{t('title')}</h1>
        <select className="border border-text-secondary p-2 rounded">
          <option>{t('select_chapter')}</option>
        </select>
        <div className="font-amiri text-lg leading-loose">{t('bismillah')}</div>
      </div>
    );
  }
  ```
- **Assets**: Host fonts locally or via Google Fonts, use lightweight geometric icons (e.g., Heroicons) for buttons and toggles.

If you need specific code snippets (e.g., a full page layout, CSS for a component, or a theme toggle implementation), mockups, or additional details for any section, let me know!