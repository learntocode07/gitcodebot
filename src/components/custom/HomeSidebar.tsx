"use client";

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { auth, currentUser } from "@clerk/nextjs/server";

import { Separator } from "../ui/separator";
import { UserButton } from "@clerk/nextjs";
import { useSidebar } from "@/components/ui/sidebar";

const sidebarItems = [
  { title: "Home", icon: Home, label: "Home" },
  // { title: "Inbox", icon: Inbox, label: "Inbox" },
  // { title: "Search", icon: Search, label: "Search" },
  // { title: "Calendar", icon: Calendar, label: "Calendar" },
  // { title: "Settings", icon: Settings, label: "Settings" },
];

export function HomeSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar collapsible={"icon"}>
      {!isCollapsed ? (
        <div className="flex items-center justify-between p-2">
          <SidebarHeader className="text-xl font-mono">GitCodeBot</SidebarHeader>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-xs font-mono">Close Sidebar</span>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex items-center justify-center p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="text-xs font-mono">Open Sidebar</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size={"lg"} className={
                    isCollapsed ? "w-10 justify-center" : "w-full"
                  } asChild>
                    <a>
                      <item.icon />
                      {!isCollapsed && (
                        <span className="font-mono">{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" decorative={true} />
        <UserButton
          showName={!isCollapsed}
          appearance={{
            elements: {
              userButtonBox: isCollapsed
                ? "p-0"
                : "gap-2 font-mono text-foreground",
              userButtonOuterIdentifier: isCollapsed ? "hidden" : "block",
              userButtonPopoverCard: "shadow-lg",
              userButtonPopoverActionButtonText: "text-foreground",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
