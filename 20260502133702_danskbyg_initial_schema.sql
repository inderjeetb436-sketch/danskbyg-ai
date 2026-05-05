
/*
  # DanskByg AI - Initial Schema

  ## Overview
  Complete schema for a Danish construction company SaaS platform.

  ## New Tables
  1. `profiles` - User profiles linked to auth.users
     - id, full_name, avatar_url, role, company_id, created_at
  2. `companies` - Construction company accounts
     - id, name, cvr_number, address, city, zip, phone, email, plan, created_at
  3. `projects` - Construction projects
     - id, company_id, name, description, status, budget, spent, start_date, end_date, address, client_name, created_at, updated_at
  4. `tasks` - Project tasks
     - id, project_id, company_id, title, description, status, priority, assigned_to, due_date, created_at
  5. `documents` - Project documents
     - id, project_id, company_id, name, file_type, file_url, size, uploaded_by, created_at
  6. `team_members` - Company team members
     - id, company_id, user_id, role, invited_email, status, created_at
  7. `ai_conversations` - AI assistant conversations
     - id, company_id, user_id, title, messages (jsonb), created_at, updated_at
  8. `invoices` - Project invoices
     - id, project_id, company_id, number, client_name, amount, status, due_date, created_at

  ## Security
  - RLS enabled on all tables
  - Users can only access data belonging to their company
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cvr_number text,
  address text DEFAULT '',
  city text DEFAULT '',
  zip text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  plan text DEFAULT 'starter',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  role text DEFAULT 'member',
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  job_title text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'planning',
  budget numeric DEFAULT 0,
  spent numeric DEFAULT 0,
  start_date date,
  end_date date,
  address text DEFAULT '',
  client_name text DEFAULT '',
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_type text DEFAULT '',
  file_url text DEFAULT '',
  size integer DEFAULT 0,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  invited_email text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'Ny samtale',
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number text NOT NULL,
  client_name text DEFAULT '',
  amount numeric DEFAULT 0,
  vat_amount numeric DEFAULT 0,
  status text DEFAULT 'draft',
  due_date date,
  issued_date date DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES
-- =====================

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

-- Companies policies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id = get_user_company_id());

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (id = get_user_company_id())
  WITH CHECK (id = get_user_company_id());

CREATE POLICY "Authenticated users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id() OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view company projects"
  ON projects FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete company projects"
  ON projects FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Tasks policies
CREATE POLICY "Users can view company tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete company tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Documents policies
CREATE POLICY "Users can view company documents"
  ON documents FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete company documents"
  ON documents FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Team members policies
CREATE POLICY "Users can view company team"
  ON team_members FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- AI conversations policies
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND company_id = get_user_company_id());

CREATE POLICY "Users can insert conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND company_id = get_user_company_id());

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Invoices policies
CREATE POLICY "Users can view company invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete company invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS projects_company_id_idx ON projects(company_id);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_company_id_idx ON tasks(company_id);
CREATE INDEX IF NOT EXISTS documents_company_id_idx ON documents(company_id);
CREATE INDEX IF NOT EXISTS team_members_company_id_idx ON team_members(company_id);
CREATE INDEX IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON invoices(company_id);

-- =====================
-- TRIGGERS
-- =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
