import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";
const { dataProvider: baseDataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
  httpClient: {
    credentials: "include",
  },
} as any);

export { kyInstance };

export const dataProvider = {
  ...baseDataProvider,
  getList: async ({ resource, pagination, filters, sorters, meta }: any) => {
    if (resource === "users") {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const query = {
        limit: pageSize,
        offset: (current - 1) * pageSize,
      };

      const response = await kyInstance.get("auth/list-users", { searchParams: query }).json<any>();

      return {
        data: response.users || [],
        total: response.total || response.users?.length || 0,
      };
    }
    return baseDataProvider.getList({ resource, pagination, filters, sorters, meta });
  },
};
