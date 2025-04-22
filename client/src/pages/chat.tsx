import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble } from "@/components/ui/bubble";
import { env } from "@/env";
import { User } from "@/types/user";
import * as React from "react";
import { useParams } from "react-router";
import { MessageInput } from "@/components/chat/message-input";
import { Message } from "@/types/message";
import { useUser } from "@/hooks/use-user";
import { socket } from "@/socket";

export function Chat() {
  const { othername } = useParams();
  const [other, setOther] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentMessage, setCurrentMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { user } = useUser();
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    async function fetchOther() {
      if (!othername) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles/${othername}`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setOther(data);
      } catch {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }

    fetchOther();
  }, [othername]);

  const fetchMessages = async () => {
    console.log("Fetching messages...");
    try {
      const res = await fetch(
        `${env.VITE_API_URL}/${user?.username}/${othername}/messages`,
      );
      if (!res.ok) throw Error;
      const data = await res.json();
      console.log("Fetched messages:", data);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  React.useEffect(() => {
    if (user && othername) {
      fetchMessages();
    }
  }, [user, othername]);

  React.useEffect(() => {
    function handlePrivateMessage(msg: Message) {
      setMessages((prev) => [...prev, msg]);
    }

    socket.on("private message", handlePrivateMessage);

    return () => {
      socket.off("private message", handlePrivateMessage);
    };
  }, [othername, user?.username]);

  const onSend = async (message: string) => {
    if (!othername || !user) return;

    setCurrentMessage("");

    socket.emit("private message", {
      content: message,
      to: othername,
    });
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (!loading && !other) {
    return <div>Failed to load this chat.</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src={other?.image} alt={othername} />
          <AvatarFallback>{othername?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{othername}</h2>
      </header>

      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <Bubble
            key={msg.id}
            createdAt={new Date(msg.created_at)}
            sender={msg.from === user?.username ? user : other}
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
