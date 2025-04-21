import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

import Home from "./home";
import { Toaster } from "sonner";
import { UserProvider } from "./providers/user-provider";
import { Login } from "./login";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
        </Routes>
        <Toaster richColors />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
);
