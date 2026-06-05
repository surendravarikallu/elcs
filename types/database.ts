// Hand-written types matching 001_initial_schema.sql
// Re-generate with `supabase gen types typescript` once project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category; Insert: CategoryInsert; Update: Partial<CategoryInsert> };
      products:   { Row: Product;  Insert: ProductInsert;  Update: Partial<ProductInsert>  };
      admin_users:{ Row: AdminUser;Insert: AdminUserInsert;Update: Partial<AdminUserInsert>};
      enquiries:  { Row: Enquiry;  Insert: EnquiryInsert;  Update: Partial<EnquiryInsert>  };
    };
  };
}

// ── Categories ──────────────────────────────────────────────

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  sort_order:  number;
  created_at:  string;
}

export type CategoryInsert = Omit<Category, "id" | "created_at"> & { id?: string; created_at?: string };

// ── Products ────────────────────────────────────────────────

export interface Product {
  id:                string;
  name:              string;
  slug:              string;
  short_description: string | null;
  description:       string | null;
  category_id:       string | null;
  price:             number | null;   // null = "Contact for price"
  image_url:         string | null;
  manual_url:        string | null;
  specs:             Record<string, string>;
  tags:              string[];
  is_published:      boolean;
  is_featured:       boolean;
  sort_order:        number;
  created_at:        string;
  updated_at:        string;
  // joined
  category?:         Category | null;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at" | "category"> & {
  id?: string; created_at?: string; updated_at?: string;
};

// ── Admin Users ─────────────────────────────────────────────

export interface AdminUser {
  id:         string;
  email:      string;
  name:       string | null;
  created_at: string;
}

export type AdminUserInsert = Omit<AdminUser, "created_at"> & { created_at?: string };

// ── Enquiries ───────────────────────────────────────────────

export interface EnquiryItem {
  product_id:   string;
  product_name: string;
  quantity:     number;
}

export type EnquiryStatus = "new" | "reviewing" | "replied" | "closed";

export interface Enquiry {
  id:             string;
  customer_name:  string;
  customer_email: string;
  customer_phone: string | null;
  company:        string | null;
  message:        string | null;
  items:          EnquiryItem[];
  status:         EnquiryStatus;
  admin_notes:    string | null;
  created_at:     string;
  updated_at:     string;
}

export type EnquiryInsert = Omit<Enquiry, "id" | "created_at" | "updated_at"> & {
  id?: string; created_at?: string; updated_at?: string;
};
