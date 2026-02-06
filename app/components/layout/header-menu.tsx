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

  if (!address || !ensName) {
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
            <span>Sign in as</span>
            <Avatar className="size-6">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${demoConfig.groupUserA.ensName}&backgroundColor=8c5cff`}
              />
              <AvatarFallback>
                {demoConfig.groupUserA.ensName.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{demoConfig.groupUserA.ensName}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signIn(
                demoConfig.groupUserB.address,
                demoConfig.groupUserB.ensName,
              )
            }
          >
            <span>Sign in as</span>
            <Avatar className="size-6">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${demoConfig.groupUserB.ensName}&backgroundColor=8c5cff`}
              />
              <AvatarFallback>
                {demoConfig.groupUserB.ensName.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{demoConfig.groupUserB.ensName}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signIn(
                demoConfig.groupUserC.address,
                demoConfig.groupUserC.ensName,
              )
            }
          >
            <span>Sign in as</span>
            <Avatar className="size-6">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${demoConfig.groupUserC.ensName}&backgroundColor=8c5cff`}
              />
              <AvatarFallback>
                {demoConfig.groupUserC.ensName.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{demoConfig.groupUserC.ensName}</span>
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
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${ensName}&backgroundColor=8c5cff`}
            />
            <AvatarFallback>{ensName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {ensName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
