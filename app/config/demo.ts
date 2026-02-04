import { GroupAgent, GroupUser } from "@/types/group";

const groupAgentA: GroupAgent = {
  address: "0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f",
  ensName: "agent-a.eth",
};

const groupUserA: GroupUser = {
  address: "0x818eD0E13030FDE0C86B771a965084e44CC7F8d6",
  ensName: "user-a.eth",
};

const groupUserB: GroupUser = {
  address: "0x568647a8f0dDc1772E97aDD23c70960138F16330",
  ensName: "user-b.eth",
};

const groupUserC: GroupUser = {
  address: "0x60aef32500a838cb6ef895478606a3d2DC0deD7c",
  ensName: "user-c.eth",
};

export const demoConfig = {
  groupAgentA,
  groupUserA,
  groupUserB,
  groupUserC,
};
