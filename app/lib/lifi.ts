import {
  createConfig,
  EVM,
  executeRoute,
  getRoutes,
  RouteExtended,
} from "@lifi/sdk";
import { WalletClient } from "viem";

export async function executeLifiRoute(args: {
  walletClient: WalletClient;
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress: string;
}): Promise<RouteExtended> {
  createConfig({
    integrator: process.env.LIFI_INTEGRATOR as string,
    apiKey: process.env.LIFI_API_KEY as string,
    routeOptions: {
      fee: 0.01,
    },
    providers: [
      EVM({
        getWalletClient: async () => args.walletClient,
      }),
    ],
  });

  const getRoutesResponse = await getRoutes({
    fromChainId: args.fromChainId,
    toChainId: args.toChainId,
    fromTokenAddress: args.fromTokenAddress,
    toTokenAddress: args.toTokenAddress,
    fromAmount: args.fromAmount,
    fromAddress: args.fromAddress, // The address from which the tokens are being transferred
  });
  console.log(
    `[LI.FI] Get routes response: ${JSON.stringify(getRoutesResponse)}`,
  );

  const route = getRoutesResponse.routes[0];
  console.log(`[LI.FI] Route: ${JSON.stringify(route)}`);

  const executeRouteResponse = await executeRoute(route, {
    // Gets called once the route object gets new updates
    updateRouteHook(route) {
      console.log(`[LI.FI] Updated route: ${JSON.stringify(route)}`);
    },
  });
  console.log(
    `[LI.FI] Execute route response: ${JSON.stringify(executeRouteResponse)}`,
  );

  return executeRouteResponse;
}
