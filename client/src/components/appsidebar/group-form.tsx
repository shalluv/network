import { SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  groupname: z
    .string()
    .min(1, "group name is required")
    .max(40, "Group name is too long"),
});

type FormSchema = z.infer<typeof formSchema>;

export function GroupForm() {
  const { user, reload } = useUser();
  const username = user?.username;

  const [open, setOpen] = React.useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupname: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      console.log(data.groupname, username);
      const res = await fetch(`${env.VITE_API_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.groupname, username: username }),
      });

      if (!res.ok) throw new Error("Failed to create group");

      toast.success("Group created successfully");
      reload();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      form.reset();
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SquarePen className="w-6 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center justify-center gap-2"
          >
            <FormField
              control={form.control}
              name="groupname"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
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
  );
}
