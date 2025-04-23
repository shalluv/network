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
import { Message } from "@/types/message";
import { socket } from "@/socket";

export function GroupChat() {
  const { groupid } = useParams();
  const [users, setUsers] = React.useState<User[]>([]);
  const [usernames, setUsernames] = React.useState<string[]>([]);
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentMessage, setCurrentMessage] = React.useState<string>("");
  const { user, reload } = useUser();
  const [groupName, setGroupName] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchUsers() {
    if (!groupid) return;
    try {
      const res = await fetch(`${env.VITE_API_URL}/groups/${groupid}/members`);
      if (!res.ok) throw Error;
      const data = await res.json();
      setUsers(data);
    } catch {
      console.error("Failed to fetch group members");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    async function getGroupName() {
      if (!groupid) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/groups`);
        if (!res.ok) throw Error;
        const data = await res.json();
        const group = data.find((item: Group) => item.id === groupid);
        if (group) setGroupName(group.name);
      } catch {
        console.error("Failed to get group name");
      }
    }

    fetchUsers();
    getGroupName();
  }, [groupid]);

  React.useEffect(() => {
    setUsernames(users.map((user) => user.username));
    setImages(users.map((user) => user.image));
  }, [users]);

  React.useEffect(() => {
    async function fetchGroupMessages() {
      if (!groupid) return;
      console.log(groupid);
      try {
        const res = await fetch(
          `${env.VITE_API_URL}/groups/${groupid}/messages`,
        );
        if (!res.ok) throw Error;
        const data = await res.json();
        console.log(data);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch group messages", err);
      }
    }

    fetchGroupMessages();
  }, [groupid]);

  React.useEffect(() => {
    console.log("test");
    function handleGroupMessage(msg: Message) {
      if (msg.to != groupid) return;
      setMessages((prev) => [...prev, msg]);
    }

    function handleJoinedGroup({
      group_id,
      user,
    }: {
      group_id: string;
      user: User;
    }) {
      if (group_id == groupid) {
        setUsers((prev) => {
          if (!prev.some((u) => u.username === user.username)) {
            return [...prev, user];
          }
          return prev;
        });
      }
    }

    function handleEditMessage(msg: Message) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    }

    function handleDeleteMessage(msg: Message) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    }

    socket.on("group message", handleGroupMessage);
    socket.on("message edited", handleEditMessage);
    socket.on("message deleted", handleDeleteMessage);
    socket.on("joined group", handleJoinedGroup);

    return () => {
      socket.off("group message", handleGroupMessage);
    };
  }, [groupid]);

  const onSend = async (message: string) => {
    if (!user || !groupid) return;
    console.log(message);

    setCurrentMessage("");

    socket.emit("group message", {
      content: message,
      to: groupid,
    });
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
    <div className="flex h-screen flex-col">
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
                  <AvatarImage
                    src={img}
                    alt={usernames[index]}
                    className="border-[1px]"
                  />
                  <AvatarFallback className="border-[1px]">
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
        <GroupInfo groupid={groupid} />
      </header>

      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <Bubble
            key={msg.id}
            id={msg.id}
            createdAt={new Date(msg.created_at)}
            sender={users.find((u) => u.username === msg.from)}
            variant={msg.from === user?.username ? "sent" : "received"}
          >
            {msg.content}
          </Bubble>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex justify-center pb-4">
        <MessageInput
          value={currentMessage}
          onChange={setCurrentMessage}
          onSend={onSend}
        />
      </div>
    </div>
  );
}
