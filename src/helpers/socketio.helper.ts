// import { ENV_KEYS } from "constants/env.constant";
import { io } from "socket.io-client";

export const socketIO = () => {
  return io("wss://staging.vshare.net", {
    transports: ["websocket"],
  });
};
