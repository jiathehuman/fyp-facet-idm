import { Button } from "@heroui/button";
import { useLocation } from 'react-router-dom';

import { Link } from "@heroui/link";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";


import { siteConfig } from "@/config/site";

import { Logo } from "@/components/icons";


export const Navbar = () => {
  const location = useLocation();
  const isIndexPage = location.pathname === '/home';
  const isRegisterOrLoginPage = (location.pathname === '/login' || location.pathname === '/register')

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />

            <p className="font-bold text-inherit">FACETS <span> - An Identity Management Platform </span></p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >

        {isIndexPage && <NavbarItem className="md:flex">
          <Button
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.login}
            variant="flat"
          >
            Login
          </Button>
        </NavbarItem>}
        {!isIndexPage && !isRegisterOrLoginPage && <NavbarItem className="md:flex">
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
