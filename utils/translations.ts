// Simple translation utility without next-intl
export async function getMessages(locale: string) {
  try {
    const messages = (await import(`@/locales/${locale}.json`)).default;
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for ${locale}:`, error);
    // Fallback to English if locale fails
    try {
      const messages = (await import(`@/locales/en.json`)).default;
      return messages;
    } catch (fallbackError) {
      console.error("Failed to load fallback messages:", fallbackError);
      return {};
    }
  }
}

// Helper function to get nested object values by key path
export function getTranslation(
  messages: any,
  key: string,
  fallback?: string,
): string {
  const keys = key.split(".");
  let value = messages;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === "string" ? value : fallback || key;
}
