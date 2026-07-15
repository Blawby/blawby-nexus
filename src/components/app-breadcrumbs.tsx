import { Link, useLocation } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbEntry = {
  label: string;
  to?: string;
};

const resourceLabels: Record<string, string> = {
  emails: "Emails",
  practices: "Practices",
  users: "Users",
};

const actionLabels: Record<string, string> = {
  create: "Create",
  edit: "Edit",
  show: "Details",
};

const toTitle = (segment: string) => {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const isLikelyIdentifier = (segment: string) => {
  return /^\d+$/.test(segment) || /^[0-9a-f-]{8,}$/i.test(segment);
};

const getSegmentLabel = (segment: string) => {
  return resourceLabels[segment] ?? actionLabels[segment] ?? toTitle(segment);
};

const getBreadcrumbs = (pathname: string): BreadcrumbEntry[] => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard" }];
  }

  const breadcrumbs: BreadcrumbEntry[] = [{ label: "Dashboard", to: "/" }];

  segments.forEach((segment, index) => {
    if (isLikelyIdentifier(segment)) {
      return;
    }

    const to = `/${segments.slice(0, index + 1).join("/")}`;
    breadcrumbs.push({
      label: getSegmentLabel(segment),
      to: index === segments.length - 1 ? undefined : to,
    });
  });

  return breadcrumbs;
};

export const AppBreadcrumbs = () => {
  const { pathname } = useLocation();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={`${breadcrumb.label}-${index}`}>
              {isCurrent || !breadcrumb.to ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={breadcrumb.to} />}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
              {!isCurrent && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
