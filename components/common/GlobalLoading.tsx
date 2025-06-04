"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useGlobalLoading } from "@/contexts/GlobalContext";

export const GlobalLoading: React.FC = () => {
  const { isLoading, message: loadingMessage } = useGlobalLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border/50 p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
          </div>

          {loadingMessage && (
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {loadingMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
