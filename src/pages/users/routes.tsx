import { Route } from "react-router";

import { UsersCreate } from "@/pages/users/create";
import { UsersEdit } from "@/pages/users/edit";
import { UsersList } from "@/pages/users/list";
import { UsersShow } from "@/pages/users/show";

export const userRoutes = (
  <Route path="/users">
    <Route index element={<UsersList />} />
    <Route path="create" element={<UsersCreate />} />
    <Route path="edit/:id" element={<UsersEdit />} />
    <Route path="show/:id" element={<UsersShow />} />
  </Route>
);
