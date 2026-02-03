import { Group } from "@/components/groups/group";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GroupPage({ params }: Props) {
  const { id } = await params;

  return <Group id={id} />;
}
