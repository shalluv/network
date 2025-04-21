import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { ChatBox } from "./chat-box";
import { User } from "@/types/user";
import React from "react";
import { env } from "@/env";

function AppSidebar() {
  const [selected, setSelected] = useState<"messages" | "groups">("messages");
  const [users, setUsers] = useState<User[]>([]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles`);
        console.log(res);
        if (!res.ok) throw Error;
        const data = await res.json();
        setUsers(data);
      } catch {
        console.error("Failed to fetch all user profiles");
      }
    }

    fetchUsers();
  }, []);

  return (
    <Sidebar>
      <div className="mt-8 flex w-full justify-between px-4 text-2xl">
        <span className="font-bold">Admin</span>
        <button className="">
          <SquarePen className="w-6" />
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
              {users.map((user, i) => (
                <ChatBox key={i} username={user.username} />
              ))}
            </div>
          ) : (
            <div>y</div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export { AppSidebar };
