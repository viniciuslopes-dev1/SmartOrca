export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, "id" | "created_at" | "updated_at"> & Partial<Pick<Workspace, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Workspace, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & Partial<Pick<Profile, "created_at" | "updated_at">>;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: Omit<WorkspaceMember, "id" | "created_at"> & Partial<Pick<WorkspaceMember, "id" | "created_at">>;
        Update: Partial<Omit<WorkspaceMember, "id" | "created_at">>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at" | "updated_at"> & Partial<Pick<Client, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Client, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at"> & Partial<Pick<Project, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Project, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: Omit<CatalogItem, "id" | "created_at" | "updated_at"> & Partial<Pick<CatalogItem, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<CatalogItem, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, "id" | "created_at" | "updated_at"> & Partial<Pick<Budget, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Budget, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      budget_groups: {
        Row: BudgetGroup;
        Insert: Omit<BudgetGroup, "id" | "created_at" | "updated_at"> & Partial<Pick<BudgetGroup, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<BudgetGroup, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      budget_items: {
        Row: BudgetItem;
        Insert: Omit<BudgetItem, "id" | "created_at" | "updated_at"> & Partial<Pick<BudgetItem, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<BudgetItem, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      budget_status_history: {
        Row: BudgetStatusHistory;
        Insert: Omit<BudgetStatusHistory, "id" | "created_at"> & Partial<Pick<BudgetStatusHistory, "id" | "created_at">>;
        Update: Partial<Omit<BudgetStatusHistory, "id" | "created_at">>;
        Relationships: [];
      };
      settings: {
        Row: Settings;
        Insert: Omit<Settings, "id" | "created_at" | "updated_at"> & Partial<Pick<Settings, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Settings, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      budget_exports: {
        Row: BudgetExport;
        Insert: Omit<BudgetExport, "id" | "exported_at"> & Partial<Pick<BudgetExport, "id" | "exported_at">>;
        Update: Partial<Omit<BudgetExport, "id" | "exported_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_budget_number: {
        Args: { target_workspace_id: string };
        Returns: number;
      };
      create_workspace_for_current_user: {
        Args: { workspace_name: string; workspace_phone?: string | null };
        Returns: Workspace;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PersonType = "individual" | "company";
export type WorkspaceRole = "owner" | "admin" | "member";
export type ProjectStatus = "planning" | "estimating" | "waiting_approval" | "approved" | "in_progress" | "finished" | "cancelled";
export type CatalogItemType = "product" | "service" | "labor" | "material" | "equipment" | "fee_other";
export type CatalogUnit = "unit" | "m2" | "m3" | "linear_meter" | "hour" | "day" | "kg" | "package" | "other";
export type BudgetStatus = "draft" | "sent" | "approved" | "rejected" | "expired" | "cancelled";
export type BudgetGroupType = "labor" | "material" | "service" | "product" | "stage" | "other";

export type Workspace = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
};

export type Client = {
  id: string;
  workspace_id: string;
  name: string;
  person_type: PersonType;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  workspace_id: string;
  client_id: string;
  name: string;
  service_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
  status: ProjectStatus;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogItem = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  type: CatalogItemType;
  unit: CatalogUnit;
  category: string | null;
  cost_unit: number;
  price_unit: number;
  default_margin: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: string;
  workspace_id: string;
  client_id: string;
  project_id: string | null;
  budget_number: number;
  title: string;
  description: string | null;
  issue_date: string;
  valid_until: string | null;
  execution_deadline: string | null;
  payment_terms: string | null;
  included_scope: string | null;
  excluded_scope: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  margin_total: number;
  total: number;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
};

export type BudgetGroup = {
  id: string;
  budget_id: string;
  name: string;
  type: BudgetGroupType;
  sort_order: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  budget_id: string;
  group_id: string | null;
  catalog_item_id: string | null;
  name: string;
  description: string | null;
  type: string | null;
  unit: string;
  quantity: number;
  cost_unit: number;
  price_unit: number;
  discount: number;
  margin: number;
  subtotal: number;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetStatusHistory = {
  id: string;
  budget_id: string;
  old_status: BudgetStatus | null;
  new_status: BudgetStatus;
  notes: string | null;
  created_at: string;
};

export type Settings = {
  id: string;
  workspace_id: string;
  company_name: string;
  company_document: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_address: string | null;
  default_budget_validity_days: number;
  default_payment_terms: string | null;
  default_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetExport = {
  id: string;
  workspace_id: string;
  budget_id: string;
  file_name: string | null;
  exported_at: string;
};

export type BudgetWithRelations = Budget & {
  clients: Client | null;
  projects: Project | null;
  budget_items: BudgetItem[];
  budget_groups?: BudgetGroupWithItems[];
};

export type ProjectWithClient = Project & {
  clients: Pick<Client, "id" | "name"> | null;
};

export type BudgetListItem = Budget & {
  clients: Pick<Client, "id" | "name"> | null;
  projects: Pick<Project, "id" | "name"> | null;
};

export type WorkspaceMembership = WorkspaceMember & {
  workspaces: Workspace | null;
};

export type BudgetGroupWithItems = BudgetGroup & {
  budget_items: BudgetItem[];
};
