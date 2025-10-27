export interface Company {
  company_id: string;
  company_name: string;
  company_code?: string | null;
  database_name: string;
  subscription_expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  user_uuid: string;
  company_id: string;
  username: string;
  email: string;
  password_hash?: string;
  fullname: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface Meta {
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
}

// Used by the `useCompanies` composable
// Used by the company user pages
export interface CompanyUser {
  fullname?: string;
  email: string;
  username: string;
  user_uuid: string;
  user_id: number;
  user_external_id?: string;
  company_name: string;
  company_id: string;
  database_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  avatar?: string;
}
