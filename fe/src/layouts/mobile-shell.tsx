import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
   IconCash,
   IconChartBar,
   IconHome,
   IconPlus,
   IconSettings,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

import { useSessionState } from "../features/auth/session-store";
import { PwaInstallPrompt } from "../components/pwa-install-prompt";
import { PullToRefresh } from "../components/pull-to-refresh";
import { TopBar } from "../components/top-bar";
import { usePwaInstallPromptState } from "../lib/pwa-install";

type TabItem = {
   to: string;
   label: string;
   icon: Icon;
   end?: boolean;
   featured?: boolean;
   requiresFamily?: boolean;
};

const allTabs: TabItem[] = [
   { to: "/", label: "Home", icon: IconHome, end: true, requiresFamily: true },
   { to: "/history", label: "History", icon: IconCash, requiresFamily: true },
   {
      to: "/add",
      label: "Add",
      icon: IconPlus,
      featured: true,
      requiresFamily: true,
   },
   {
      to: "/insights",
      label: "Insights",
      icon: IconChartBar,
      requiresFamily: true,
   },
   { to: "/settings", label: "Settings", icon: IconSettings },
];

const familyPages: { path: string; label: string }[] = [
   { path: "/settings/family", label: "Family" },
   { path: "/family/setup", label: "Family Setup" },
   { path: "/family/join", label: "Family Join" },
];

function getPageTitle(location: { pathname: string }, tabs: TabItem[]): string {
   // Check main tabs
   for (const tab of tabs) {
      if (tab.to === "/" && location.pathname === "/") return tab.label;
      if (tab.to !== "/" && location.pathname.startsWith(tab.to))
         return tab.label;
   }
   // Check family pages
   for (const page of familyPages) {
      if (location.pathname.startsWith(page.path)) return page.label;
   }
   return "dompetku.id";
}

export function MobileShell() {
   const session = useSessionState();
   const { isIOS } = usePwaInstallPromptState();
   const location = useLocation();
   const tabs = session.hasFamily
      ? allTabs
      : allTabs.filter((tab) => !tab.requiresFamily);
   const pageTitle = getPageTitle(location, tabs);
   const userName = session.user?.name?.trim() || "You";

   return (
      <div className="mobile-shell">
         <TopBar title={pageTitle} subtitle={`Welcome back, ${userName}`} />
         <PullToRefresh>
            <main className="mobile-shell__content">
               <Outlet />
            </main>
         </PullToRefresh>

         <div className="mobile-shell__pwa-prompt-mobile">
            <PwaInstallPrompt position="bottom" />
         </div>

         <nav className="mobile-shell__tabs" aria-label="Primary">
            <div className="mobile-shell__nav-brand">
               <span className="mobile-shell__nav-brand-mark">D</span>
               <span className="mobile-shell__nav-brand-name">dompetku.id</span>
            </div>
            {tabs.map((tab) => {
               const TabIcon = tab.icon;

               return (
                  <NavLink
                     key={tab.to}
                     to={tab.to}
                     end={tab.end}
                     className={({ isActive }) =>
                        [
                           "mobile-shell__tab-link",
                           !isIOS ? "mobile-shell__tab-link--android" : "",
                           isActive ? "mobile-shell__tab-link--active" : "",
                           tab.featured
                              ? "mobile-shell__tab-link--featured"
                              : "",
                        ]
                           .filter(Boolean)
                           .join(" ")
                     }
                  >
                     <span
                        className="mobile-shell__tab-icon"
                        aria-hidden="true"
                     >
                        <TabIcon
                           size={tab.featured ? 24 : 20}
                           stroke={tab.featured ? 2.2 : 1.8}
                        />
                     </span>
                     <span className="mobile-shell__tab-label">
                        {tab.label}
                     </span>
                  </NavLink>
               );
            })}

            <div className="mobile-shell__pwa-prompt-desktop">
               <PwaInstallPrompt position="bottom" variant="desktop-sidebar" />
            </div>
         </nav>

         {session.hasFamily ? (
            <NavLink
               to="/add"
               className={({ isActive }) =>
                  [
                     "mobile-shell__desktop-add",
                     isActive ? "mobile-shell__desktop-add--active" : "",
                  ]
                     .filter(Boolean)
                     .join(" ")
               }
               aria-label="Add transaction"
            >
               <span className="mobile-shell__desktop-add-icon" aria-hidden="true">
                  <IconPlus size={20} stroke={2.2} />
               </span>
            </NavLink>
         ) : null}
      </div>
   );
}
