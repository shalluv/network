import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { ChatBox } from "./chat-box";
import { User } from "@/types/user";
import React from "react";
import { env } from "@/env";
import { UserForm } from "./user-form";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

function AppSidebar() {
  const [selected, setSelected] = useState<"messages" | "groups">("messages");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<User[][]>([
    [
      { username: "admin999", image: "https://i.pravatar.cc/150?img=1" },
      { username: "user123", image: "https://i.pravatar.cc/150?img=2" },
    ],
    [
      { username: "user456", image: "https://i.pravatar.cc/150?img=3" },
      { username: "user789", image: "https://i.pravatar.cc/150?img=4" },
      { username: "user101", image: "https://i.pravatar.cc/150?img=5" },
    ],
  ]);
  const { user } = useUser();

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

    fetchUsers();
  }, []);

  return (
    <Sidebar>
      <div className="mt-8 flex w-full justify-between px-4 text-2xl">
        <UserForm />
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
              {users.map(
                (userProfile, i) =>
                  user?.username != userProfile.username && (
                    <ChatBox
                      key={i}
                      username={userProfile.username}
                      image={userProfile.image}
                    />
                  ),
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-2 pl-2">
              {groups.map((group, i) => (
                <div key={i} className="relative flex w-fit">
                  <div className="size-14 flex-shrink-0 rounded-full">
                    {group.slice(0, 2).map((userProfile, j) => (
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
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export { AppSidebar };
