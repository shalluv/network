import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";

function GroupChatBox({ group, users }: { group: string; users: User[] }) {
  const [lastMessage, setLastMessage] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState("");
  const read = false;
  const navigate = useNavigate();
  const { groupid } = useParams();
  const usernames = users.map((user) => user.username);

  React.useEffect(() => {
    async function fetchLastMessage() {
      setLastMessage("tesetsettese4huiwueifhuiwefs");
      setLastMessageTime("12:21");
    }

    fetchLastMessage();
  }, []);

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
            {users.slice(0, 2).map((userProfile, j) => (
              <Avatar
                key={userProfile.username}
                className={cn(
                  "absolute size-12",
                  j % 2 === 0 ? "-top-1 -left-1" : "-right-1 -bottom-1",
                )}
              >
                <AvatarImage
                  src={userProfile.image}
                  alt={userProfile.username}
                />
                <AvatarFallback>{userProfile.username}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1 overflow-hidden">
          <span
            className={`w-40 truncate ${read ? "font-normal" : "font-bold"}`}
            title={usernames.join(", ")}
          >
            {usernames.join(", ")}
          </span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`text-sm ${read ? "font-light text-gray-600" : "font-semibold"} max-w-48 truncate`}
              title={lastMessage}
            >
              {lastMessage}
            </span>
            <span
              className={`text-sm ${read ? "font-light text-gray-600" : "font-semibold"} flex-shrink-0 whitespace-nowrap`}
              title={lastMessageTime}
            >
              {lastMessageTime}
            </span>
          </div>
        </div>
      </div>

      {!read && (
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

export { GroupChatBox };
