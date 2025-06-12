import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const baseStyles =
  "px-4 py-2 rounded-lg font-medium transition-colors duration-200";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer",
  danger: "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const style = `${baseStyles} ${variants[variant]} ${className}`;
  return (
    <button className={style} {...props}>
      {children}
    </button>
  );
};

export default Button;
