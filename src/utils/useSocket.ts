import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const backUrl = "http://localhost:3000";

const useSocket = (teamId?: number): [Socket | null, () => void, boolean] => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (teamId && !socket.current) {
      socket.current = io(`${backUrl}/chats/${teamId}`, {
        transports: ["websocket"],
        query: {
          token: localStorage.getItem("accessToken"),
        },
      });

      socket.current.on("connect", () => {
        setIsConnected(true);
      });

      socket.current.on("disconnect", () => {
        setIsConnected(false);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [teamId]);

  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  };

  return [socket.current, disconnect, isConnected];
};

export default useSocket;
