import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { env } from "./env";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { useNavigate } from "react-router";
import { useUser } from "./hooks/use-user";
import React from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function Login() {
  const { reload } = useUser();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
    },
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (data: LoginSchema) => {
    const { username } = data;
    try {
      const res = await fetch(`${env.VITE_API_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw Error;
      localStorage.setItem("username", username);
      toast.success("Login successful");
      reload();
      navigate("/");
    } catch {
      toast.error("Login failed");
    }
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
