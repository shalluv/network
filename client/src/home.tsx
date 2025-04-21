import { Bubble } from "./components/ui/bubble";
import { AppSidebar } from "./components/appsidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Home = () => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <div className="flex w-full flex-col gap-2">
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
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Home;
