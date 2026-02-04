import { Button } from "@/components/ui/button";
import { Group } from "@/mongodb/models/group";
import Link from "next/link";

export function GroupCard(props: { group: Group }) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <p className="text-sm text-muted-foreground">
        ID: {props.group._id.toString()}
      </p>
      <p className="text-sm text-muted-foreground">
        Created: {new Date(props.group.created).toLocaleString()}
      </p>
      <Link href={`/groups/${props.group._id.toString()}`}>
        <Button className="mt-2">Open group</Button>
      </Link>
    </div>
  );
}
