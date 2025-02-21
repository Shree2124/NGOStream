import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "../ui/sidebar";
// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

export function AppSidebar() {
  // const items = [
  //   {
  //     title: "Home",
  //     url: "#",
  //     icon: Home,
  //   },
  //   {
  //     title: "Inbox",
  //     url: "#",
  //     icon: Inbox,
  //   },
  //   {
  //     title: "Calendar",
  //     url: "#",
  //     icon: Calendar,
  //   },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: Search,
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: Settings,
  //   },
  // ];



  return (
    <SidebarMenu className="flex w-[20%]">
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            first
          </SidebarMenuButton>
        </CollapsibleTrigger>  
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
                first 1
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  </SidebarMenu>
  );
}
