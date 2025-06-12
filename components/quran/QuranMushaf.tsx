import React from "react";
import QuranReader from "../../app/[locale]/quran/QuranReader";

interface QuranMushafProps {
  locale: string;
  messages: any;
}

export const QuranMushaf: React.FC<QuranMushafProps> = ({
  locale,
  messages,
}) => {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {messages?.quran?.mushaf || "Mushaf View"}
        </h2>
        <p className="text-muted">
          {messages?.quran?.mushafDescription ||
            "Interactive Mushaf with page-by-page reading experience"}
        </p>
      </div>

      {/* Integrated QuranReader component */}
      <QuranReader locale={locale} messages={messages} />
    </div>
  );
};
