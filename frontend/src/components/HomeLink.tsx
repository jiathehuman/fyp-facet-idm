import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "@/constants";
import { ReactNode } from "react";

interface HomeLinkProps {
  children: ReactNode;
}

export function HomeLink({ children }: HomeLinkProps) {
  const navigate = useNavigate();

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const access = localStorage.getItem(ACCESS_TOKEN);
    if (!access) return navigate("/");
    else return navigate("/dashboard")
  };

  return (
    <RouterLink to="/dashboard" onClick={onClick} className="flex justify-start items-center gap-1">
      {children}
    </RouterLink>
  );
}
