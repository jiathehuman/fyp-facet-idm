export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Facet",
  description: "Identity and Profile Management Platform",
  // navItems: [
  //   {
  //     label: "Home",
  //     href: "/",
  //   },
  //   {
  //     label: "Login",
  //     href: "/login",
  //   },
  //   {
  //     label: "Docs",
  //     href: "/docs",
  //   },
  //   {
  //     label: "Pricing",
  //     href: "/pricing",
  //   },
  //   {
  //     label: "Blog",
  //     href: "/blog",
  //   },
  //   {
  //     label: "About",
  //     href: "/about",
  //   },
  // ],
  // navMenuItems: [
  //   {
  //     label: "Profile",
  //     href: "/profile",
  //   },
  //   {
  //     label: "Dashboard",
  //     href: "/dashboard",
  //   },
  //   {
  //     label: "Projects",
  //     href: "/projects",
  //   },
  //   {
  //     label: "Team",
  //     href: "/team",
  //   },
  //   {
  //     label: "Calendar",
  //     href: "/calendar",
  //   },
  //   {
  //     label: "Settings",
  //     href: "/settings",
  //   },
  //   {
  //     label: "Help & Feedback",
  //     href: "/help-feedback",
  //   },
  //   {
  //     label: "Logout",
  //     href: "/logout",
  //   },
  // ],
  links: {
    login: "/login",
    register: "/register",
    persona: "/persona/:id",
    logout: "/logout",
    about: "/about"
  },
};
