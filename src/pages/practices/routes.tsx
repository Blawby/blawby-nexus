import { Route } from "react-router";

import { PracticesCreate } from "@/pages/practices/create";
import { PracticesEdit } from "@/pages/practices/edit";
import { PracticesList } from "@/pages/practices/list";
import { PracticesShow } from "@/pages/practices/show";

export const practiceRoutes = (
  <Route path="/practices">
    <Route index element={<PracticesList />} />
    <Route path="create" element={<PracticesCreate />} />
    <Route path="edit/:id" element={<PracticesEdit />} />
    <Route path="show/:id" element={<PracticesShow />} />
  </Route>
);
