import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import { Message } from "@/types/message";
import { env } from "@/env";
import { useUser } from "@/hooks/use-user";
import { format } from "date-fns";

function ChatBox({
  username,
  image,
  online,
}: {
  username: string;
  image: string;
  online: boolean;
}) {
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const navigate = useNavigate();
  const { othername } = useParams();
  const { user } = useUser();

  React.useEffect(() => {
    const fetchMessages = async () => {
      console.log("Fetching messages...");
      try {
        const res = await fetch(
          `${env.VITE_API_URL}/${user?.username}/${username}/messages`,
        );
        if (!res.ok) throw Error;
        const data = await res.json();
        const last = data.length !== 0 ? data[data.length - 1] : null;
        setLastMessage(last ? last : null);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    function handlePrivateMessage(msg: Message) {
      if (
        (msg.from === user?.username && msg.to === username) ||
        (msg.to === user?.username && msg.from === username)
      ) {
        setLastMessage(msg);
      }
    }

    function handleEditMessage(msg: Message) {
      setLastMessage((prev) => (prev?.id === msg.id ? msg : prev));
    }

    function handleDeleteMessage() {
      fetchMessages();
    }

    socket.on("private message", handlePrivateMessage);
    socket.on("message edited", handleEditMessage);
    socket.on("message deleted", handleDeleteMessage);

    return () => {
      socket.off("private message", handlePrivateMessage);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between px-4 py-2",
        othername === username
          ? "bg-neutral-200"
          : "bg-transparent hover:bg-neutral-100",
      )}
      onClick={() => {
        navigate(`/${username}`);
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-500">
          <Avatar className="h-14 w-14">
            <AvatarImage src={image} alt={username} />
            <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col justify-center gap-1 overflow-hidden">
          <span
            className={`w-40 truncate ${!online ? "font-normal" : "font-bold"}`}
            title={username}
          >
            {username}
          </span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`text-sm ${!online ? "font-light text-gray-600" : "font-semibold"} max-w-48 truncate`}
              title={lastMessage ? lastMessage.content : "No message yet"}
            >
              {lastMessage ? lastMessage.content : "No message yet"}
            </span>
            <span
              className={`text-sm ${!online ? "font-light text-gray-600" : "font-semibold"} flex-shrink-0 whitespace-nowrap`}
              title={
                lastMessage?.created_at
                  ? format(lastMessage.created_at, "HH:mm")
                  : ""
              }
            >
              {lastMessage?.created_at
                ? format(lastMessage.created_at, "HH:mm")
                : ""}
            </span>
          </div>
        </div>
      </div>

      {online && (
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

export { ChatBox };
