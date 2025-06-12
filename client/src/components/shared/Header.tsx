import { NavLink } from "react-router";
import logo from "../../assets/DevTasks-Logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between">
      <NavLink to="/">
        <img src={logo} alt="DevTasks logo" className="w-32 h-auto" />
      </NavLink>

      <nav className="flex gap-4">
        <NavLink to="/" className="text-xl text-gray-950 hover:text-gray-500">
          Home
        </NavLink>
        <NavLink to="projects" className="text-xl text-gray-950 hover:text-gray-500">
          Projects
        </NavLink>
        <NavLink to="profile" className="text-xl text-gray-950 hover:text-gray-500">
          Profile
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
