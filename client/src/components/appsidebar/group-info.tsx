import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import React from "react";
import { User } from "@/types/user";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { env } from "@/env";

export function GroupInfo({
  groupid,
  users,
}: {
  groupid: string | undefined;
  users: User[];
}) {
  const [open, setOpen] = React.useState(false);
  const { user } = useUser();

  const HandleLeave = async () => {
    console.log(user?.username);
    if (!user?.username || !groupid) return;
    try {
      const res = await fetch(
        `${env.VITE_API_URL}/groups/${groupid}/members/${user.username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) throw Error;
      toast.success("Exited group successfully");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch {
      console.error("Failed to exit the group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Info />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription>
            <div className="mt-4 flex max-h-80 flex-col gap-4 overflow-scroll">
              {users.map((userProfile) => (
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={userProfile.image}
                      alt={userProfile.username}
                    />
                    <AvatarFallback>
                      {userProfile.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p>{userProfile.username}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                className=""
                onClick={() => HandleLeave()}
              >
                exit group
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
