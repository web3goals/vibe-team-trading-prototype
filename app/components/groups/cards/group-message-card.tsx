import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { shortenAddress } from "@/lib/address";
import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { GroupMessageLifiDrawer } from "../drawers/group-message-lifi-drawer";
import { GroupMessageYellowDrawer } from "../drawers/group-message-yellow-drawer";

export function GroupMessageCard(props: {
  group: Group;
  groupMessage: GroupMessage;
}) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-row gap-4">
        {/* Left part */}
        <Avatar className="size-10">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${props.groupMessage.creatorEnsName}&backgroundColor=${props.groupMessage.creatorRole === "agent" ? "79c0ff" : "8c5cff"}`}
          />
          <AvatarFallback>
            {props.groupMessage.creatorEnsName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Right part */}
        <div className="w-full">
          {/* Creator ENS name, address, created */}
          <div>
            <div className="flex flex-row gap-2">
              <p className="font-bold">{props.groupMessage.creatorEnsName} </p>
              <p className="font-bold text-muted-foreground">
                {shortenAddress(props.groupMessage.creatorAddress)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(props.groupMessage.created).toLocaleString()}
            </p>
          </div>
          {/* Content */}
          <div className="text-sm mt-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                p: ({ node, ...props }) => {
                  void node;
                  return <p className="mb-4 last:mb-0" {...props} />;
                },
                pre: ({ node, ...props }) => {
                  void node;
                  return (
                    <div className="overflow-auto w-full my-2 bg-black/10 dark:bg-black/30 p-2 rounded-md">
                      <pre {...props} />
                    </div>
                  );
                },
                code: ({ node, ...props }) => {
                  void node;
                  return (
                    <code
                      className="bg-black/10 dark:bg-black/30 rounded-sm px-1 py-0.5"
                      {...props}
                    />
                  );
                },
              }}
            >
              {props.groupMessage.content}
            </ReactMarkdown>
          </div>
          {/* Separator for Yellow and LI.FI buttons */}
          {(props.groupMessage.extra?.yellow ||
            props.groupMessage.extra?.lifi) && (
            <>
              <Separator className="mt-4" />
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                {/* Yellow button */}
                {props.groupMessage.extra?.yellow && (
                  <GroupMessageYellowDrawer
                    group={props.group}
                    groupMessage={props.groupMessage}
                  />
                )}
                {/* LI.FI button */}
                {props.groupMessage.extra?.lifi && (
                  <GroupMessageLifiDrawer groupMessage={props.groupMessage} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
