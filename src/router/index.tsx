import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";
import Profile from "../pages/Profile";
import Projects from "../pages/Projects";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {index: true, element: <Home />},
            {path: 'projects', element: <Projects />},
            {path: 'profile', element: <Profile />},
        ]
    }
])