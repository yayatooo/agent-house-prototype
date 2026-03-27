"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Building2,
  Command,
  ChartColumn,
  GalleryVerticalEnd,
  Home,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-project";
import { NavUser } from "./nav-user";

const teams = [
  { name: "Evindo House", logo: GalleryVerticalEnd, plan: "Enterprise" },
  { name: "Evindo House", logo: AudioWaveform, plan: "Startup" },
  { name: "Evindo Corp.", logo: Command, plan: "Free" },
];

const navMain = [
  {
    title: "Dashboard",
    url: "/admin/mainpage",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      { title: "Main Page", url: "/admin/mainpage" },
      { title: "Properties", url: "/properties" },
    ],
  },
  {
    title: "Properties",
    url: "/properties",
    icon: Home,
    items: [
      { title: "All Properties", url: "/properties" },
      { title: "New Property", url: "/properties/new" },
    ],
  },
  {
    title: "Branch Management",
    url: "/branch",
    icon: Building2,
    items: [
      { title: "All Branches", url: "/branch" },
      { title: "New Branch", url: "/branch/new" },
    ],
  },
  {
    title: "Sales",
    url: "/sales",
    icon: BookOpen,
    items: [
      { title: "Team Sales", url: "/sales" },
      { title: "Accounts", url: "/accounts" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [{ title: "General", url: "/settings" }],
  },
];

const projects = [
  { name: "Reports", url: "#", icon: ChartColumn },
  { name: "Sales & Marketing", url: "#", icon: PieChart },
  { name: "Feedback", url: "#", icon: Map },
];

interface AppSidebarClientProps extends React.ComponentProps<typeof Sidebar> {
  user: { name: string; email: string; avatar: string };
}

export function AppSidebarClient({ user, ...props }: AppSidebarClientProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
