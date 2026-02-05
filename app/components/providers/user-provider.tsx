"use client";

import { YellowSessionAccount } from "@/types/yellow";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { createContext, ReactNode, useContext, useState } from "react";

type UserState = {
  address: string | undefined;
  ensName: string | undefined;
  sessionAccountPrivateKey: string | undefined;
  isLoading: boolean;
};

type UserContextType = UserState & {
  signIn: (address: string, ensName: string) => void;
  signOut: () => void;
  isSigningIn: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({
    address: undefined,
    ensName: undefined,
    sessionAccountPrivateKey: undefined,
    isLoading: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      address,
      ensName,
    }: {
      address: string;
      ensName: string;
    }) => {
      const { data } = await axios.post("/api/yellow/session-account", {
        address,
      });
      return {
        sessionAccount: data.data.sessionAccount as YellowSessionAccount,
        address,
        ensName,
      };
    },
    onSuccess: (data: {
      sessionAccount: YellowSessionAccount;
      address: string;
      ensName: string;
    }) => {
      setState({
        address: data.address,
        ensName: data.ensName,
        sessionAccountPrivateKey: data.sessionAccount.privateKey,
        isLoading: false,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to sign in:", error);
    },
  });

  function signIn(address: string, ensName: string) {
    loginMutation.mutate({ address, ensName });
  }

  function signOut() {
    setState({
      address: undefined,
      ensName: undefined,
      sessionAccountPrivateKey: undefined,
      isLoading: false,
    });
  }

  return (
    <UserContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        isSigningIn: loginMutation.isPending,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
