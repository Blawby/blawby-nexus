import type {
  BaseRecord,
  CrudFilter,
  DataProvider,
  GetListParams,
  GetOneParams,
} from "@refinedev/core";
import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";

const { dataProvider: baseDataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
  kyOptions: {
    credentials: "include",
  },
});

export { kyInstance };

type OpsListResponse<TData> = {
  data?: TData[];
  items?: TData[];
  emails?: TData[];
  users?: TData[];
  total?: number;
  count?: number;
};

type OpsOneResponse<TData> = TData & {
  data?: TData;
  email?: TData;
};

const isLogicalFilter = (
  filter: CrudFilter
): filter is CrudFilter & { field: string; value: unknown } => {
  return "field" in filter;
};

const getFilterValue = (
  filters: GetListParams["filters"] | undefined,
  field: string
) => {
  const filter = filters?.find(
    (item) => isLogicalFilter(item) && item.field === field
  );
  return filter && isLogicalFilter(filter) ? filter.value : undefined;
};

const getSearchParam = (
  filters: GetListParams["filters"] | undefined,
  field: string
) => {
  const value = getFilterValue(filters, field);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const getScopedParam = (
  filters: GetListParams["filters"] | undefined,
  field: string,
  metaValue?: unknown
) => {
  const value = getFilterValue(filters, field) ?? metaValue;
  return typeof value === "string" && value && value !== "all" ? value : undefined;
};

const getPaginationQuery = (
  pagination: GetListParams["pagination"] | undefined,
  fallbackPageSize: number
) => {
  const current = pagination?.currentPage ?? 1;
  const pageSize = pagination?.pageSize ?? fallbackPageSize;

  return {
    current,
    pageSize,
    limit: pageSize,
    offset: (current - 1) * pageSize,
  };
};

const unwrapList = <TData extends BaseRecord>(
  response: OpsListResponse<TData>
) => {
  const data =
    response.data ?? response.items ?? response.emails ?? response.users ?? [];

  return {
    data,
    total: response.total ?? response.count ?? data.length,
  };
};

const unwrapOne = <TData extends BaseRecord>(
  response: OpsOneResponse<TData>
) => {
  if (response.data) return response.data;
  if (response.email) return response.email;
  return response;
};

export const dataProvider: DataProvider = {
  ...baseDataProvider,
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
    sorters,
    meta,
  }: GetListParams) => {
    if (resource === "users" || resource === "practices") {
      const { limit, offset } = getPaginationQuery(pagination, 20);
      const query: Record<string, string | number> = { limit, offset };
      const search = getSearchParam(filters, "q") ?? getSearchParam(filters, "search");
      const status = getScopedParam(filters, "status");

      if (search) query.q = search;
      if (status) query.status = status;

      const response = await kyInstance
        .get(`ops/${resource}`, { searchParams: query })
        .json<OpsListResponse<TData>>();

      return unwrapList(response);
    }

    if (resource === "practiceInvitations") {
      const practiceId = meta?.practiceId;
      if (typeof practiceId !== "string" || !practiceId) {
        return { data: [], total: 0 };
      }

      const { limit, offset } = getPaginationQuery(pagination, 10);
      const query: Record<string, string | number> = { limit, offset };
      const search = getSearchParam(filters, "q") ?? getSearchParam(filters, "search");
      const status = getScopedParam(filters, "status");

      if (search) query.q = search;
      if (status) query.status = status;

      const response = await kyInstance
        .get(`ops/practices/${practiceId}/invitations`, { searchParams: query })
        .json<OpsListResponse<TData>>();

      return unwrapList(response);
    }

    if (resource === "emails") {
      const { limit, offset } = getPaginationQuery(pagination, 20);
      const query: Record<string, string | number> = {
        limit,
        offset,
      };

      const recipient = getSearchParam(filters, "recipient");
      const status = getScopedParam(filters, "status");
      const practiceId = getScopedParam(filters, "practiceId", meta?.practiceId);

      if (recipient) query.recipient = recipient;
      if (status) query.status = status;
      if (practiceId) query.practiceId = practiceId;

      const response = await kyInstance
        .get("ops/emails", { searchParams: query })
        .json<OpsListResponse<TData>>();

      return unwrapList(response);
    }
    return baseDataProvider.getList({ resource, pagination, filters, sorters, meta });
  },
  getOne: async <TData extends BaseRecord = BaseRecord>({
    resource,
    id,
  }: GetOneParams) => {
    if (resource === "users" || resource === "practices") {
      const response = await kyInstance
        .get(`ops/${resource}/${id}`)
        .json<OpsOneResponse<TData>>();

      return {
        data: unwrapOne(response),
      };
    }

    if (resource === "emails") {
      const response = await kyInstance
        .get(`ops/emails/${id}`)
        .json<OpsOneResponse<TData>>();
      return {
        data: unwrapOne(response),
      };
    }

    return baseDataProvider.getOne({ resource, id });
  },
};
