export type OpsPractice = {
  id: string;
  name?: string | null;
  practiceName?: string | null;
  displayName?: string | null;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
};

export type PracticeInvitation = {
  id: string;
  organization_id?: string | null;
  organizationId?: string | null;
  organization_name?: string | null;
  organizationName?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  expires_at?: string | null;
  expiresAt?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  inviter?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
};
