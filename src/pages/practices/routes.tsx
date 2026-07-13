import { Route } from "react-router";

import { PracticesCreate } from "./create";
import { PracticesEdit } from "./edit";
import { PracticesList } from "./list";
import { PracticesShow } from "./show";

export const practiceRoutes = (
  <Route path="/practices">
    <Route index element={<PracticesList />} />
    <Route path="create" element={<PracticesCreate />} />
    <Route path="edit/:id" element={<PracticesEdit />} />
    <Route path="show/:id" element={<PracticesShow />} />
  </Route>
);
