import { Route } from "react-router";

import { EmailsList } from "./list";

export const emailRoutes = (
  <Route path="/emails">
    <Route index element={<EmailsList />} />
  </Route>
);
