import { socket } from "@/socket";
import { useEffect, useState } from "react";
import { MessageCirclePlus } from "lucide-react";

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

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center text-gray-600">
        <MessageCirclePlus className="mb-4 size-40 stroke-1" />
        <p>Your messages</p>
        <p>Send a message to start a chat</p>
      </div>
    </div>
  );
};

export default Home;
