export const resources = [
  {
    name: "dashboard",
    list: "/",
  },
  {
    name: "users",
    list: "/users",
    create: "/users/create",
    edit: "/users/edit/:id",
    show: "/users/show/:id",
  },
  {
    name: "practices",
    list: "/practices",
    create: "/practices/create",
    edit: "/practices/edit/:id",
    show: "/practices/show/:id",
  },
  {
    name: "emails",
    list: "/emails",
  },
];
