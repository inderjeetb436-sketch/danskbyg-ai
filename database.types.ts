export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          cvr_number: string | null;
          address: string;
          city: string;
          zip: string;
          phone: string;
          email: string;
          plan: string;
          logo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: string;
          company_id: string | null;
          job_title: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string;
          status: string;
          budget: number;
          spent: number;
          start_date: string | null;
          end_date: string | null;
          address: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          company_id: string;
          title: string;
          description: string;
          status: string;
          priority: string;
          assigned_to: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          project_id: string | null;
          company_id: string;
          name: string;
          file_type: string;
          file_url: string;
          size: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      team_members: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          role: string;
          invited_email: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>;
      };
      ai_conversations: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          title: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_conversations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ai_conversations']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          project_id: string | null;
          company_id: string;
          number: string;
          client_name: string;
          amount: number;
          vat_amount: number;
          status: string;
          due_date: string | null;
          issued_date: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
    };
  };
}

export type Company = Database['public']['Tables']['companies']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type AiConversation = Database['public']['Tables']['ai_conversations']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
