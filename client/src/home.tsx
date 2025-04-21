import { useForm } from "react-hook-form";
import { Bubble } from "./components/ui/bubble";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { AppSidebar } from "./components/appsidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { env } from "./env";
import { cn } from "./lib/utils";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  image: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const Home = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      image: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    const { username, image } = data;
    try {
      const res = await fetch(`${env.VITE_API_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, image }),
      });
      if (!res.ok) throw new Error("Failed to create profile");
      const result = await res.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Button>Hello World</Button>
        </main>
      </SidebarProvider>
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <div className="flex w-full flex-col gap-2">
          <Bubble
            createdAt={new Date()}
            variant="received"
            sender={"Poonpipob"}
          >
            Message 1
          </Bubble>
          <Bubble
            createdAt={new Date()}
            variant="received"
            sender={"Poonpipob"}
          >
            Message 2
          </Bubble>
          <Bubble createdAt={new Date()} variant="sent">
            Message sent
          </Bubble>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div
                        className={cn(
                          "relative flex aspect-square size-16 cursor-pointer items-center justify-center overflow-hidden rounded-full text-center",
                          field.value
                            ? "animate-spin"
                            : "border-2 border-dashed",
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
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Home;
