import { Route } from "react-router";

import { UsersCreate } from "./create";
import { UsersEdit } from "./edit";
import { UsersList } from "./list";
import { UsersShow } from "./show";

export const userRoutes = (
  <Route path="/users">
    <Route index element={<UsersList />} />
    <Route path="create" element={<UsersCreate />} />
    <Route path="edit/:id" element={<UsersEdit />} />
    <Route path="show/:id" element={<UsersShow />} />
  </Route>
);
