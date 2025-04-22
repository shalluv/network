import { env } from "@/env";
import { UserContext } from "@/hooks/use-user";
import { socket } from "@/socket";
import { User } from "@/types/user";
import * as React from "react";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function fetchUser() {
    const username = localStorage.getItem("username");
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${env.VITE_API_URL}/profiles/${username}`);
      if (!res.ok) throw Error;
      const data = await res.json();
      setUser(data);
      if (socket.connected) socket.disconnect();
      socket.io.opts.query = {
        username,
      };
      socket.connect();
    } catch {
      console.error("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchUser();
  }, []);

  const reload = async () => {
    setLoading(true);
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, reload }}>
      {children}
    </UserContext.Provider>
  );
};
