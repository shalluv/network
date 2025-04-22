import { ChevronRight, Ellipsis } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useForm } from "react-hook-form";
import React from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

const formSchema = z.object({
  newMessage: z.string().min(1, "Message cannot be empty"),
});

type FormSchema = z.infer<typeof formSchema>;

export function MessageForm({ id }: { id: string }) {
  const { reload } = useUser();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newMessage: "",
    },
  });

  const onEdit = async (data: FormSchema) => {
    try {
      const res = await fetch(`${env.VITE_API_URL}/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data.newMessage }),
      });

      if (!res.ok) throw new Error("Failed to edit message");

      toast.success("Edited message successfully");
      reload();
      form.reset();
      setOpenDialog(false);
      //   window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const onDelete = async () => {
    try {
      const res = await fetch(`${env.VITE_API_URL}/messages/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to delete message");

      toast.success("Deleted message successfully");
      reload();
      form.reset();
      //   window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative flex items-center gap-2 text-xs">
      {showMenu ? (
        <>
          <ChevronRight
            className="text-muted-foreground cursor-pointe -mx-1 size-4"
            onClick={() => setShowMenu(false)}
          />
          <button
            onClick={() => {
              setOpenDialog(true);
              setShowMenu(false);
            }}
            className="cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="cursor-pointer"
          >
            Delete
          </button>
        </>
      ) : (
        <Ellipsis
          className="text-muted-foreground size-4 cursor-pointer"
          onClick={() => setShowMenu(true)}
        />
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEdit)}
              className="flex w-full flex-col items-center justify-center gap-2"
            >
              <FormField
                control={form.control}
                name="newMessage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>New Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new message" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
