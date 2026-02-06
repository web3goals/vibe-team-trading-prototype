import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { shortenAddress } from "@/lib/address";
import { Group } from "@/mongodb/models/group";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export function GroupCard(props: { group: Group }) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-row gap-4">
        {/* Left part */}
        <Avatar className="size-10">
          <AvatarFallback className="bg-accent text-accent-foreground">
            {props.group.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Right part */}
        <div className="w-full">
          {/* Name, description */}
          <div>
            <p className="font-bold">{props.group.name}</p>
            <p className="text-sm text-muted-foreground">
              {props.group.description}
            </p>
          </div>
          {/* Created */}
          <div className="flex flex-col gap-1 mt-4">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">
              {new Date(props.group.created).toLocaleString()}
            </p>
          </div>
          {/* Agent */}
          <div className="flex flex-col gap-1 mt-4">
            <p className="text-sm text-muted-foreground">Agent</p>
            <div className="flex flex-row items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${props.group.agent.ensName}&backgroundColor=79c0ff`}
                />
                <AvatarFallback>
                  {props.group.agent.ensName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm">{props.group.agent.ensName}</p>
              <p className="text-sm text-muted-foreground">
                {shortenAddress(props.group.agent.address)}
              </p>
            </div>
          </div>
          {/* Users */}
          <div className="flex flex-col gap-1 mt-4">
            <p className="text-sm text-muted-foreground">Users</p>
            {props.group.users.map((user, index) => (
              <div key={index} className="flex flex-row items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.ensName}&backgroundColor=8c5cff`}
                  />
                  <AvatarFallback>
                    {user.ensName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm">{user.ensName}</p>
                <p className="text-sm text-muted-foreground">
                  {shortenAddress(user.address)}
                </p>
              </div>
            ))}
          </div>
          <Separator className="mt-4" />
          {/* Buttons */}
          <Link href={`/groups/${props.group._id.toString()}`}>
            <Button className="mt-4">
              <ChevronRightIcon /> Open group
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
