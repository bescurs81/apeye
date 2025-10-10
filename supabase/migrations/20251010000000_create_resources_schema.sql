/*
  # Website Resources Database Schema

  ## Overview
  Creates a database schema for storing and organizing useful website resources into categories.

  ## New Tables

  ### `resource_categories`
  Stores categories for organizing website resources.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `name` (text) - Category name (e.g., "CSS Tools", "Mockups")
  - `description` (text) - Category description
  - `icon` (text) - Optional icon name or emoji
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `resources`
  Stores individual website resources with metadata.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `category_id` (uuid, foreign key) - Links to resource_categories
  - `name` (text) - Website/resource name
  - `url` (text) - Website URL
  - `description` (text) - Short description
  - `favicon_url` (text) - Optional favicon/thumbnail URL
  - `tags` (text[]) - Array of tags for additional organization
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own resources and categories
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create resource_categories table
CREATE TABLE IF NOT EXISTS resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES resource_categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  description text DEFAULT '',
  favicon_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_categories_user_id ON resource_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING gin(tags);

-- Enable RLS
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resource_categories table

CREATE POLICY "Users can view own categories"
  ON resource_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON resource_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON resource_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON resource_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for resources table

CREATE POLICY "Users can view own resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at for both tables
DROP TRIGGER IF EXISTS update_resource_categories_updated_at ON resource_categories;
CREATE TRIGGER update_resource_categories_updated_at
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
