import { firstPresent } from "@/lib/resource-helpers";
import type { OpsUser } from "@/pages/users/types";

export const getUserEmailVerified = (user: OpsUser) => {
  return firstPresent(user.email_verified, user.emailVerified) ?? false;
};

export const getUserOnboardingComplete = (user: OpsUser) => {
  return firstPresent(user.onboarding_complete, user.onboardingComplete) ?? false;
};

export const getUserCreatedAt = (user: OpsUser) => {
  return firstPresent(user.created_at, user.createdAt);
};

export const getUserUpdatedAt = (user: OpsUser) => {
  return firstPresent(user.updated_at, user.updatedAt);
};

export const getUserBanReason = (user: OpsUser) => {
  return firstPresent(user.ban_reason, user.banReason);
};

export const getUserBanExpires = (user: OpsUser) => {
  return firstPresent(user.ban_expires, user.banExpires);
};
