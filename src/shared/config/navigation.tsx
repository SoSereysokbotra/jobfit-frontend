import React from "react";
import {
  Home,
  Search,
  Star,
  Bookmark,
  Briefcase,
  Calendar,
  Award,
  User,
  FileText,
  BarChart3,
  Bell,
  HelpCircle,
  Settings,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  iconName: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
}

export interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    group: "",
    items: [
      { href: "/dashboard", label: "Dashboard", iconName: "Home", icon: <Home size={18} /> },
    ],
  },
  {
    group: "DISCOVERY",
    items: [
      { href: "/jobs", label: "Search Jobs", iconName: "Search", icon: <Search size={18} /> },
      { href: "/recommendations", label: "Recommendations", iconName: "Star", icon: <Star size={18} /> },
      { href: "/saved-jobs", label: "Saved Jobs", iconName: "Bookmark", icon: <Bookmark size={18} /> },
    ],
  },
  {
    group: "YOUR JOURNEY",
    items: [
      { href: "/applications", label: "Applications", iconName: "Briefcase", icon: <Briefcase size={18} /> },
      { href: "/learning", label: "Interview Prep", iconName: "Calendar", icon: <Calendar size={18} /> },
      { href: "/offers", label: "Offers & Decisions", iconName: "Award", icon: <Award size={18} /> },
    ],
  },
  {
    group: "PROFILE & RESOURCES",
    items: [
      { href: "/profile", label: "My Profile", iconName: "User", icon: <User size={18} /> },
      { href: "/resumes", label: "Resumes", iconName: "FileText", icon: <FileText size={18} /> },
      { href: "/insights", label: "Career Insights", iconName: "BarChart3", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    group: "HELP & PREFERENCES",
    items: [
      { href: "/notifications", label: "Notifications", iconName: "Bell", icon: <Bell size={18} /> },
      { href: "/help", label: "Help & Feedback", iconName: "HelpCircle", icon: <HelpCircle size={18} /> },
      { href: "/settings", label: "Settings", iconName: "Settings", icon: <Settings size={18} /> },
    ],
  },
];

/** Flat list of all navigation items for quick searching */
export const ALL_NAVIGATION_ITEMS: NavigationItem[] = NAVIGATION_GROUPS.flatMap((g) => g.items);
