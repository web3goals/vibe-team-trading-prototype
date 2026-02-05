"use client";

import { useUser } from "@/components/providers/user-provider";
import { demoConfig } from "@/config/demo";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function HeaderMenu() {
  const { address, ensName, signIn, signOut, isSigningIn } = useUser();

  if (!address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isSigningIn}>
            <LogInIcon />
            {isSigningIn ? "Signing in..." : "Sign in"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              signIn(
                demoConfig.groupUserA.address,
                demoConfig.groupUserA.ensName,
              )
            }
          >
            Sign in as User A
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signIn(
                demoConfig.groupUserB.address,
                demoConfig.groupUserB.ensName,
              )
            }
          >
            Sign in as User B
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signIn(
                demoConfig.groupUserC.address,
                demoConfig.groupUserC.ensName,
              )
            }
          >
            Sign in as User C
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${ensName}&backgroundColor=1e293b`}
            />
            <AvatarFallback>{ensName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {ensName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
