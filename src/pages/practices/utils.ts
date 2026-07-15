import { firstPresent } from "@/lib/resource-helpers";
import type { OpsPractice } from "@/pages/practices/types";

export const getPracticeName = (practice: OpsPractice | undefined) => {
  return firstPresent(
    practice?.name,
    practice?.practiceName,
    practice?.displayName
  ) ?? "Practice";
};

export const getPracticeListName = (practice: OpsPractice) => {
  return firstPresent(
    practice.name,
    practice.practiceName,
    practice.displayName
  ) ?? "Unnamed practice";
};

export const getPracticeCreatedAt = (practice: OpsPractice) => {
  return firstPresent(practice.created_at, practice.createdAt);
};

export const getPracticeUpdatedAt = (practice: OpsPractice) => {
  return firstPresent(practice.updated_at, practice.updatedAt);
};
