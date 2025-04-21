import { Button } from "./components/ui/button";
import { AppSidebar } from "./components/appsidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Home = () => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Button>Hello World</Button>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Home;
