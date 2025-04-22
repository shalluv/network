import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useState } from "react";
import { ChatBox } from "./chat-box";
import { User } from "@/types/user";
import { Group } from "@/types/group";
import React from "react";
import { env } from "@/env";
import { UserForm } from "./user-form";
import { useUser } from "@/hooks/use-user";
import { GroupChatBox } from "./group-chat-box";
import { GroupForm } from "./group-form";
import { socket } from "@/socket";

function AppSidebar() {
  const [selected, setSelected] = useState<"messages" | "groups">(() => {
    const saved = localStorage.getItem("parentState");
    return saved === "groups" || saved === "messages" ? saved : "messages";
  });
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsernames, setOnlineUsernames] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { user } = useUser();

  React.useEffect(() => {
    localStorage.setItem("parentState", selected);
  }, [selected]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setUsers(data);
      } catch {
        console.error("Failed to fetch all user profiles");
      }
    }

    async function fetchGroups() {
      try {
        const res = await fetch(`${env.VITE_API_URL}/groups`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setGroups(data);
      } catch {
        console.error("Failed to fetch all groups");
      }
    }

    function handleUsers(usernames: string[]) {
      setOnlineUsernames(usernames);
    }
    function handleConnected({ username }: { username: string }) {
      setOnlineUsernames((prev) => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });
    }

    function handleDisconnected({ username }: { username: string }) {
      setOnlineUsernames((prev) => prev.filter((user) => user !== username));
    }

    fetchUsers();
    fetchGroups();
    socket.on("users", handleUsers);
    socket.on("user connected", handleConnected);
    socket.on("user disconnected", handleDisconnected);

    const handleDisconnect = () => {
      socket.emit("disconnect");
    };

    window.addEventListener("beforeunload", handleDisconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
    };
  }, []);

  return (
    <Sidebar>
      <div className="mt-8 flex w-full justify-between px-4 text-2xl">
        <UserForm />
        <button className="">
          <GroupForm />
        </button>
      </div>
      <div className="mt-12 mb-6 flex w-full justify-between px-4">
        <button
          onClick={() => setSelected("messages")}
          className={`font-medium ${
            selected === "messages" ? "text-black" : "text-gray-400"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setSelected("groups")}
          className={`font-medium ${
            selected === "groups" ? "text-black" : "text-gray-400"
          }`}
        >
          Groups
        </button>
      </div>
      <SidebarContent>
        <div className="mb-6">
          {selected === "messages" ? (
            <div className="flex flex-col">
              {users.map(
                (userProfile) =>
                  user?.username != userProfile.username && (
                    <ChatBox
                      key={userProfile.username}
                      username={userProfile.username}
                      image={userProfile.image}
                      online={onlineUsernames.includes(userProfile.username)}
                    />
                  ),
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {groups.map((group, i) => (
                <GroupChatBox key={i} group={group.id} name={group.name} />
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export { AppSidebar };
