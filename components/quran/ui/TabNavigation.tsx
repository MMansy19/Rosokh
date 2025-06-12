import React from "react";
import { BookOpen, Search, Book, GraduationCap } from "lucide-react";
import { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  messages: any;
  onTabChange?: (fromTab: TabType, toTab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  messages,
  onTabChange,
}) => {
  const handleTabClick = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(activeTab, tab);
    }
    setActiveTab(tab);
  };

  const tabs = [
    {
      id: "learn" as TabType,
      icon: GraduationCap,
      label: "تعلم",
    },
    {
      id: "read" as TabType,
      icon: BookOpen,
      label: "اقرأ",
    },
    {
      id: "search" as TabType,
      icon: Search,
      label: "بحث",
    },
    {
      id: "mushaf" as TabType,
      icon: Book,
      label: "المصحف",
    },
  ];

  return (
    <div className="flex justify-center mb-8 mx-auto items-center">
      <div className="flex flex-row md:gap-4 gap-2 bg-surface rounded-lg p-1 border border-border">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === id
                ? "bg-primary text-white shadow-md"
                : "text-muted hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
