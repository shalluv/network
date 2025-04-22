import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble } from "@/components/ui/bubble";
import { env } from "@/env";
import { User } from "@/types/user";
import * as React from "react";
import { useParams } from "react-router";
import { MessageInput } from "@/components/chat/message-input";
import { cn } from "@/lib/utils";
import { GroupInfo } from "@/components/appsidebar/group-info";
import { useUser } from "@/hooks/use-user";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Group } from "@/types/group";

export function GroupChat() {
  const { groupid } = useParams();
  const [users, setUsers] = React.useState<User[]>([]);
  const [usernames, setUsernames] = React.useState<string[]>([]);
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentMessage, setCurrentMessage] = React.useState<string>("");
  const { user, reload } = useUser();
  const [groupName, setGroupName] = React.useState<string>("");

  React.useEffect(() => {
    async function fetchUsers() {
      if (!groupid) return;
      try {
        const res = await fetch(
          `${env.VITE_API_URL}/groups/${groupid}/members`,
        );
        if (!res.ok) throw Error;
        const data = await res.json();
        setUsers(data);
        console.log(users);
      } catch {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }

    async function getGroupName() {
      if (!groupid) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/groups`);
        if (!res.ok) throw Error;
        const data = await res.json();
        const group = data.find((item: Group) => item.id === groupid);
        if (group) {
          setGroupName(group.name);
        }
      } catch {
        console.error("Failed to get group name");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    getGroupName();
  }, [groupid]);

  React.useEffect(() => {
    setUsernames(users.map((user) => user.username));
    setImages(users.map((user) => user.image));
  }, [users]);

  const onSend = async (message: string) => {
    console.log("Sending message:", message);
  };

  const avatarCount = images.length;
  const containerWidth =
    avatarCount === 1
      ? "w-[2.0rem]"
      : avatarCount === 2
        ? "w-[2.8rem]"
        : "w-[3.2rem]";

  const handleClick = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`${env.VITE_API_URL}/groups/${groupid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username }),
      });
      if (!res.ok) throw Error;

      toast.success("Joined group successfully");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reload();
      window.location.reload();
    } catch {
      console.error("Failed to join the group");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (!loading && !users) {
    return <div>Failed to load this chat.</div>;
  }

  if (user && !usernames.includes(user.username)) {
    console.log(users);
    console.log(user);
    return (
      <div className="flex h-full w-fit flex-col items-center justify-center gap-2 self-center">
        <EyeOff className="mb-4 size-40 stroke-1" />
        <span>You are not currently in this group</span>
        <Button className="w-full" onClick={() => handleClick()}>
          Join
        </Button>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col justify-between">
      <div className="flex w-full flex-col">
        <header className="flex w-full items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "relative h-8 flex-shrink-0 overflow-hidden rounded-full",
                containerWidth,
              )}
            >
              {images.slice(0, 3).map((img, index) => (
                <div
                  key={index}
                  className="absolute size-8"
                  style={{
                    left: `${index * 20}%`,
                    zIndex: images.length - index,
                  }}
                >
                  <Avatar>
                    <AvatarImage src={img} alt={usernames[index]} />
                    <AvatarFallback>
                      {usernames[index].slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
            <span
              className={"max-w-xl truncate text-lg font-semibold"}
              title={usernames.join(", ")}
            >
              {groupName ? groupName : usernames.join(", ")}
            </span>
          </div>
          <GroupInfo groupid={groupid} users={users} />
        </header>
        <div className="flex w-full flex-col gap-2 p-4">
          <Bubble createdAt={new Date()} sender={users[0]} variant="received">
            Hi
          </Bubble>
          <Bubble createdAt={new Date()} variant="sent">
            Hi back
          </Bubble>
        </div>
      </div>
      <div className="mb-4 flex w-full">
        <MessageInput
          value={currentMessage}
          onChange={setCurrentMessage}
          onSend={onSend}
        />
      </div>
    </div>
  );
}
