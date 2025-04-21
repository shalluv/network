"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { bubbleVariants } from "./variants";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

import { format } from "date-fns";
import { User } from "@/types/user";

export interface BubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bubbleVariants> {
  createdAt: Date;
  sender?: User | null;
}

function Bubble({
  className,
  variant,
  sender,
  createdAt,
  ...props
}: BubbleProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        variant === "received" && "justify-start",
        variant === "sent" && "justify-end",
      )}
    >
      {sender && (
        <Avatar>
          <AvatarImage src={sender.image} alt={sender.username} />
          <AvatarFallback>{sender.username.slice(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      {variant === "sent" && (
        <span className="text-muted-foreground hidden text-xs group-hover:inline">
          {format(createdAt, "HH:mm")}
        </span>
      )}
      <div className={cn(bubbleVariants({ variant }), className)} {...props} />
      {variant === "received" && (
        <span className="text-muted-foreground hidden text-xs group-hover:inline">
          {format(createdAt, "HH:mm")}
        </span>
      )}
    </div>
  );
}

export { Bubble };
