import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

import Home from "./pages/home";
import { Toaster } from "sonner";
import { UserProvider } from "./providers/user-provider";
import { Login } from "./pages/login";
import HomeLayout from "./pages/layout";
import { Chat } from "./pages/chat";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<HomeLayout />}>
            <Route index element={<Home />} />
            <Route path="/:othername" element={<Chat />} />
          </Route>
          <Route path="login" element={<Login />} />
        </Routes>
        <Toaster richColors />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
);
