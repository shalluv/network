import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { ChatBox } from "./chat-box";

function AppSidebar() {
  const [selected, setSelected] = useState<"messages" | "groups">("messages");

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
              {/* Static */}
              {Array.from({ length: 100 }, (_, i) => (
                <ChatBox key={i} username={"admin911"} />
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
