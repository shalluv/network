import { env } from "@/env";
import React from "react";
import { useState } from "react";

function ChatBox({ username }: { username: string }) {
  const [profile, setProfile] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState("");
  const read = false;

  React.useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles/${username}`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setProfile(data);
      } catch {
        console.error("Failed to fetch profile");
      }
    }

    fetchProfile();
  }, [username]);

  React.useEffect(() => {
    async function fetchLastMessage() {
      setLastMessage("tesetsettese4huiwueifhuiwefs");
      setLastMessageTime("12:21");
    }

    fetchLastMessage();
  }, [profile]);

  return (
    <div className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-500 shadow-sm">
          {profile.image && (
            <img
              src={profile.image}
              alt="profile"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center gap-1 overflow-hidden">
          <span
            className={`truncate ${read ? "font-normal" : "font-bold"}`}
            title={username}
          >
            {username}
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

export { ChatBox };
