"use client";

import { NotificationBell } from "@/components/NotificationBell";
import { NewPropertyDrawer } from "@/components/NewPropertyDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <NotificationBell />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <NewPropertyDrawer />
            </span>
          </TooltipTrigger>
          <TooltipContent>Cadastre um novo imóvel (atalho N)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ThemeToggle />
            </span>
          </TooltipTrigger>
          <TooltipContent>Alternar tema</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PersonaSwitcher />
    </div>
  );
}

