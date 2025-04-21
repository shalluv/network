import { ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import React from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const formSchema = z.object({
  image: z.string().min(1, "Image is required"),
});

type FormSchema = z.infer<typeof formSchema>;

export function UserForm() {
  const { user, loading, reload } = useUser();
  const username = user?.username;

  const [open, setOpen] = React.useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: "",
    },
  });

  React.useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles/${username}`);
        if (!res.ok) throw Error;
        const data = await res.json();
        form.setValue("image", data.image);
      } catch {
        console.error("Failed to fetch profile");
      }
    }

    fetchProfile();
  }, [username, form]);

  const onSubmit = async (data: FormSchema) => {
    const { image } = data;
    try {
      const res = await fetch(`${env.VITE_API_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, image }),
      });
      if (!res.ok) throw new Error("Failed to edit profile");
      toast.success("Profile updated successfully");
      reload();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          disabled={loading || !username}
          className="flex items-center"
        >
          <Avatar>
            <AvatarImage src={user?.image} alt={user?.username} />
            <AvatarFallback>{user?.username.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <p className="text-xl">{username}</p> <ChevronDown />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center justify-center gap-2"
          >
            <FormField
              name="image"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div
                      className={cn(
                        "relative flex aspect-square size-32 cursor-pointer items-center justify-center overflow-hidden rounded-full text-center",
                        !field.value && "border-2 border-dashed",
                      )}
                    >
                      {!field.value ? (
                        <p>Upload</p>
                      ) : (
                        <>
                          <img
                            src={field.value}
                            alt="Preview"
                            className="size-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                            <p className="text-white">Change</p>
                          </div>
                        </>
                      )}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            field.onChange(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem className="w-full">
              <FormLabel>Username</FormLabel>
              <Input value={username} disabled />
            </FormItem>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
