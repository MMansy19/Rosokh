import React from "react";
import { BookOpen, Search, Book, GraduationCap, Settings } from "lucide-react";
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
      id: "read" as TabType,
      icon: BookOpen,
      label: messages?.quran?.read || "قراءة",
      shortLabel: "قراءة",
    },
    {
      id: "search" as TabType,
      icon: Search,
      label: messages?.quran?.search || "بحث",
      shortLabel: "بحث",
    },
    {
      id: "mushaf" as TabType,
      icon: Book,
      label: messages?.quran?.mushaf || "مصحف",
      shortLabel: "مصحف",
    },
  ];

  return (
    <div className="flex justify-center items-center py-2">
      <div className="flex bg-surface rounded-lg p-1 overflow-x-auto">
        {tabs.map(({ id, icon: Icon, label, shortLabel }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 whitespace-nowrap text-sm sm:text-base font-medium ${
              activeTab === id
                ? "bg-primary text-white shadow-md"
              : "text-muted hover:bg-surfaceChild"
            }`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
