import React from "react";
import { Surah } from "../types";

interface SurahHeaderProps {
  surah: Surah;
  messages: any;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({
  surah,
  messages,
}) => {
  return (
    <div className="text-center mb-8 p-6 bg-secondary rounded-lg border border-border">
      <h2 className="text-3xl font-amiri text-foreground mb-2">{surah.name}</h2>
      <h3 className="text-xl font-bold text-primary mb-2">
        {surah.englishName}
      </h3>
      <p className="text-muted">
        {surah.revelationType} • {surah.numberOfAyahs}{" "}
        {messages?.quran?.verses || "verses"}
      </p>
    </div>
  );
};
