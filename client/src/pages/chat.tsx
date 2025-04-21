import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble } from "@/components/ui/bubble";
import { env } from "@/env";
import { User } from "@/types/user";
import * as React from "react";
import { useParams } from "react-router";

export function Chat() {
  const { othername } = useParams();
  const [other, setOther] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

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
    <div className="flex w-full flex-col">
      <header className="flex w-full items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src={other?.image} alt={othername} />
          <AvatarFallback>{othername?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{othername}</h2>
      </header>
      <div className="flex w-full flex-col gap-2 p-4">
        <Bubble createdAt={new Date()} sender={othername} variant="received">
          Hi
        </Bubble>
        <Bubble createdAt={new Date()} variant="sent">
          Hi back
        </Bubble>
      </div>
    </div>
  );
}
