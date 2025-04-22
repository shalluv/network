import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble } from "@/components/ui/bubble";
import { env } from "@/env";
import { User } from "@/types/user";
import * as React from "react";
import { useParams } from "react-router";
import { MessageInput } from "@/components/chat/message-input";

export function Chat() {
  const { othername } = useParams();
  const [other, setOther] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentMessage, setCurrentMessage] = React.useState<string>("");

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

  React.useEffect(() => {
    async function fetchMessages() {
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

    fetchMessages();
  }, [othername]);

  const onSend = async (message: string) => {
    console.log("Sending message:", message);
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
    <div className="flex size-full flex-col justify-between">
      <div className="flex w-full flex-col">
        <header className="flex w-full items-center gap-4 border-b p-4">
          <Avatar>
            <AvatarImage src={other?.image} alt={othername} />
            <AvatarFallback>{othername?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">{othername}</h2>
        </header>
        <div className="flex w-full flex-col gap-2 p-4">
          <Bubble createdAt={new Date()} sender={other} variant="received">
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
