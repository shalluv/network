import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { env } from "@/env";
import { useUser } from "@/hooks/use-user";
import { socket } from "@/socket";
import { format } from "date-fns";
import { Message } from "@/types/message";

function GroupChatBox({ group, name }: { group: string; name: string }) {
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const navigate = useNavigate();
  const { groupid } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const { user } = useUser();

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${env.VITE_API_URL}/groups/${group}/members`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setUsers(data);
      } catch {
        console.error("Failed to fetch all user profiles");
      }
    }

    fetchUsers();
  }, []);

  React.useEffect(() => {
    const fetchMessages = async () => {
      console.log("Fetching messages...");
      try {
        const res = await fetch(`${env.VITE_API_URL}/groups/${group}/messages`);
        if (!res.ok) throw Error;
        const data = await res.json();
        const last = data.length !== 0 ? data[data.length - 1] : null;
        setLastMessage(last ? last : null);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    function handleGroupMessage(msg: Message) {
      if (msg.to === group) {
        setLastMessage(msg);
      }
    }

    function handleEditMessage(msg: Message) {
      setLastMessage((prev) => (prev?.id === msg.id ? msg : prev));
    }

    function handleDeleteMessage() {
      fetchMessages();
    }

    socket.on("group message", handleGroupMessage);
    socket.on("message edited", handleEditMessage);
    socket.on("message deleted", handleDeleteMessage);

    return () => {
      socket.off("group message", handleGroupMessage);
    };
  }, []);

  React.useEffect(() => {
    setUsernames(users.map((user) => user.username));
  }, [users]);

  React.useEffect(() => {
    async function fetchLastMessage() {
      setJoined(user ? !usernames.includes(user.username) : false);
    }

    fetchLastMessage();
  }, [usernames]);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between px-4 py-2",
        groupid === group
          ? "bg-neutral-200"
          : "bg-transparent hover:bg-neutral-100",
      )}
      onClick={() => {
        navigate(`/group/${group}`);
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex w-fit">
          <div className="size-14 flex-shrink-0 rounded-full">
            {(users.length === 0
              ? [null, null]
              : users.length === 1
                ? [users[0], null]
                : users.slice(0, 2)
            ).map((userProfile, j) => (
              <Avatar
                key={userProfile?.username || `empty-${j}`}
                className={cn(
                  "absolute size-12 bg-white",
                  j % 2 === 1 ? "-top-1 -left-1" : "-right-1 -bottom-1 z-10",
                )}
              >
                {userProfile ? (
                  <>
                    <AvatarImage
                      src={userProfile.image}
                      alt={userProfile.username}
                    />
                    <AvatarFallback>
                      {userProfile.username.slice(0, 2)}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback />
                )}
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1 overflow-hidden">
          <span
            className={`w-40 truncate ${joined ? "font-normal" : "font-bold"}`}
            title={name ? name : usernames.join(", ")}
          >
            {name
              ? name
              : usernames.length != 0
                ? usernames.join(", ")
                : "Empty Group"}
          </span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`text-sm ${joined ? "font-light text-gray-600" : "font-semibold"} max-w-48 truncate`}
              title={lastMessage?.content}
            >
              {!joined
                ? lastMessage
                  ? lastMessage.content
                  : "No message yet"
                : "You are not in the group"}
            </span>
            <span
              className={`text-sm ${joined ? "font-light text-gray-600" : "font-semibold"} flex-shrink-0 whitespace-nowrap`}
              title={
                lastMessage?.created_at
                  ? format(lastMessage.created_at, "HH:mm")
                  : ""
              }
            >
              {lastMessage?.created_at
                ? !joined
                  ? format(lastMessage.created_at, "HH:mm")
                  : ""
                : ""}
            </span>
          </div>
        </div>
      </div>

      {!joined && (
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

export { GroupChatBox };
