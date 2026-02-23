import { ChainhooksClient } from "@hirosystems/chainhooks-client";

export const getChainhooksClient = () => {
  return new ChainhooksClient();
};
