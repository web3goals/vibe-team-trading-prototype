import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { GroupMessage } from "@/types/group";
import { ClassValue } from "clsx";

export function GroupMessageLifiDrawer(props: {
  groupMessage: GroupMessage;
  className?: ClassValue;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className={cn(props.className)}>
          <Avatar className="size-4">
            <AvatarImage src="/images/lifi.png" />
          </Avatar>
          Open LI.FI data
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>LI.FI data</DrawerTitle>
          <DrawerDescription>
            Vibe together, trade together, and let AI do the heavy lifting
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2">
            {JSON.stringify(
              JSON.parse(
                props.groupMessage.extra?.lifi?.executeRouteResponse || "{}",
              ),
              null,
              2,
            )}
          </pre>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
