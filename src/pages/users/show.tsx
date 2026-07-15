import { ArrowLeft } from "lucide-react";
import { useShow } from "@refinedev/core";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/resource-helpers";
import { EmailsTable } from "@/pages/emails/components/EmailsTable";
import {
  getUserBanExpires,
  getUserBanReason,
  getUserCreatedAt,
  getUserEmailVerified,
  getUserOnboardingComplete,
  getUserUpdatedAt,
} from "@/pages/users/utils";
import type { OpsUser } from "@/pages/users/types";

const formatBoolean = (value: boolean | null | undefined) => {
  return value ? "Yes" : "No";
};

export const UsersShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { query } = useShow<OpsUser>({
    resource: "users",
    id,
  });

  const user = query.data?.data;
  const title = user?.name ?? user?.email ?? "User";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Account identity, dashboard roles, and access state.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigate("/users");
          }}
        >
          <ArrowLeft />
          Users
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="rounded-md border p-4">
          {query.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading user...</p>
          ) : query.isError ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium text-destructive">User could not be loaded.</p>
              <p className="text-muted-foreground">{getErrorMessage(query.error)}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void query.refetch();
                }}
              >
                Retry
              </Button>
            </div>
          ) : user ? (
            <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{user.name ?? "Unnamed user"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all font-medium">{user.email ?? "No email"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Roles</dt>
                <dd className="font-medium">{user.role ?? "No role"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email verified</dt>
                <dd className="font-medium">{formatBoolean(getUserEmailVerified(user))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Onboarding complete</dt>
                <dd className="font-medium">{formatBoolean(getUserOnboardingComplete(user))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Banned</dt>
                <dd className="font-medium">{formatBoolean(user.banned)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{user.phone ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ban reason</dt>
                <dd className="font-medium">{getUserBanReason(user) ?? "None"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ban expires</dt>
                <dd className="font-medium">{formatDate(getUserBanExpires(user))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{formatDate(getUserCreatedAt(user))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">{formatDate(getUserUpdatedAt(user))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="break-all font-mono text-xs">{user.id}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">User not found.</p>
          )}
        </TabsContent>
        <TabsContent value="emails">
          {query.isLoading ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Loading user...
            </div>
          ) : query.isError ? (
            <div className="space-y-3 rounded-md border p-4 text-sm">
              <p className="font-medium text-destructive">User could not be loaded.</p>
              <p className="text-muted-foreground">{getErrorMessage(query.error)}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void query.refetch();
                }}
              >
                Retry
              </Button>
            </div>
          ) : user?.email ? (
            <EmailsTable key={user.email} recipientEmail={user.email} compact />
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Emails are unavailable until the user email is loaded.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};
