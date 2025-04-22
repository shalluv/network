import { socket } from "@/socket";
import { useEffect, useState } from "react";

const Home = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      console.log("connected");
      setIsConnected(true);
    }
    function onDisconnect() {
      console.log("disconnected");
      setIsConnected(false);
    }
    function onConnectError(err: Error) {
      // console.error("Connection error:", err);
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  return <div>{String(isConnected)}</div>;
};

export default Home;
