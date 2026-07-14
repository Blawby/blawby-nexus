import * as React from "react"
import { useGetIdentity } from "@refinedev/core"
import {
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type SidebarIdentity = {
  id: string
  name?: string | null
  email?: string | null
  avatar?: string | null
}

const data = {
  team: {
    name: "Blawby AI",
    logo: GalleryVerticalEnd,
    plan: "Ops Console",
  },
  navMain: [
    {
      title: "Core",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Practices",
          url: "/practices",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: identity } = useGetIdentity<SidebarIdentity>()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={identity ?? {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
