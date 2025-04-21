import { AppSidebar } from "../components/appsidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { Outlet, useNavigate } from "react-router";

const HomeLayout = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!localStorage.getItem("username")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex min-h-dvh w-full flex-col">
          {/* <SidebarTrigger /> */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default HomeLayout;
