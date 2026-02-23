import { SignClient } from "@walletconnect/sign-client";
export const initWalletConnect = async () => {
  return await SignClient.init({
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
    metadata: {
      name: "Chess dApp",
      description: "Web3 Chess game",
      url: "https://chess-dapp.xyz",
      icons: ["https://chess-dapp.xyz/icon.png"]
    }
  });
};
