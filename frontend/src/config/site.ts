export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Facet",
  description: "Identity and Profile Management Platform",
  links: {
    login: "/login",
    register: "/register",
    persona: "/persona/:id",
    logout: "/logout",
    about: "/about"
  },
};
