import { Button } from "@heroui/button";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { Link } from "@heroui/link";
import { ACCESS_TOKEN } from "@/constants";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";


import { siteConfig } from "@/config/site";
import { HomeLink } from "./HomeLink";
import { Logo } from "@/components/icons";


export const Navbar = () => {
  const location = useLocation();
    const navigate = useNavigate();

    const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const access = localStorage.getItem(ACCESS_TOKEN);
      if (!access) return navigate("/");

      try {
        await api.get("/auth/me");
        navigate("/dashboard");
      } catch {
        navigate("/");
      }
    };


  console.log(location.pathname)
  // const isIndexPage = location.pathname === '/';
  // const isRegisterOrLoginPage = (location.pathname === '/login' || location.pathname === '/register')

  const isPage = (paths: string[]): boolean => {
    return paths.includes(location.pathname);
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <HomeLink>
            <Logo/>
            <p className="font-bold text-inherit">FACETS <span> - An Identity Management Platform </span></p>
          </HomeLink>
          {/* <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />

            <p className="font-bold text-inherit">FACETS <span> - An Identity Management Platform </span></p>
          </Link> */}
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >

        {isPage(["/", "/register", "/about"]) && <NavbarItem className="md:flex">
          <Button
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.login}
            variant="flat"
          >
            Login
          </Button>
        </NavbarItem>}
        {/* {!isIndexPage && !isRegisterOrLoginPage && <NavbarItem className="md:flex"> */}
        {!isPage(["/", "/register", "/login", "/about"]) && <NavbarItem className="md:flex">
          <Button
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.login}
            variant="flat"
          >
            Logout
          </Button>
        </NavbarItem>}
      </NavbarContent>
    </HeroUINavbar>
  );
};
