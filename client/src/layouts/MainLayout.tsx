import React from "react";
import { Outlet } from "react-router";
import Header from "../components/shared/Header";

const MainLayout: React.FC = () => (
  <div className="container mx-auto">
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);
export default MainLayout;
