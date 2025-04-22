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

export function GroupInfo({ users }: { users: User[] }) {
  const [open, setOpen] = React.useState(false);

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
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
