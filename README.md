# API Key Manager & Resource Organizer

A secure, full-featured web application for managing API keys, passwords, and organizing useful website resources. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Overview

This application serves two main purposes:
1. **API Key Manager** - Securely store and manage API keys, passwords, and credentials with AES-256 encryption
2. **Resource Organizer** - Organize and categorize useful websites, tools, and resources with an accordion-style interface

## ✅ Completed Features

### Core Infrastructure
- [x] React + TypeScript + Vite setup
- [x] Tailwind CSS styling with custom theme system
- [x] Supabase backend integration
- [x] PostgreSQL database with Row Level Security (RLS)
- [x] User authentication (email/password)

### Theme System
- [x] Three complete themes: Dark (default), Light, and Emerald
- [x] Custom CSS variables for consistent theming
- [x] Persistent theme selection (localStorage)
- [x] Smooth theme transitions
- [x] Theme switcher in navigation

### API Key Management
- [x] **Database Schema**
  - [x] Encrypted storage for passwords and API keys
  - [x] Service name, email/username fields
  - [x] Notes and tags for organization
  - [x] Timestamps (created_at, updated_at)
  - [x] Row Level Security policies

- [x] **CRUD Operations**
  - [x] Create new API key entries
  - [x] Read/view all keys
  - [x] Update existing keys
  - [x] Delete keys with confirmation

- [x] **Security Features**
  - [x] AES-256 encryption using Web Crypto API
  - [x] Session-based encryption keys
  - [x] Show/hide sensitive data
  - [x] Copy to clipboard functionality
  - [x] Automatic key clearing on logout

- [x] **Organization & Search**
  - [x] Tag-based categorization
  - [x] Search across service names, emails, and notes
  - [x] Filter by tags
  - [x] Sort by creation date

- [x] **Data Management**
  - [x] Export to JSON format
  - [x] Export to CSV format
  - [x] Import from JSON file
  - [x] Encrypted data preservation on export

### User Interface
- [x] **Navigation**
  - [x] Multi-page navigation (API Keys, Settings, Documentation)
  - [x] Responsive header with user info
  - [x] Sign out functionality

- [x] **API Keys Page**
  - [x] Searchable data table
  - [x] Inline edit and delete
  - [x] Show/hide sensitive fields
  - [x] Tag filtering
  - [x] Export/import buttons

- [x] **Settings Page**
  - [x] Account information display
  - [x] Theme selector with visual previews
  - [x] Sign out option

- [x] **Documentation Page**
  - [x] Security overview
  - [x] Usage instructions
  - [x] Best practices guide
  - [x] Organization tips

- [x] **Authentication**
  - [x] Sign up form
  - [x] Sign in form
  - [x] Error handling
  - [x] Loading states

### Design & Responsiveness
- [x] Clean, modern UI design
- [x] Responsive layout (mobile to desktop)
- [x] Smooth animations and transitions
- [x] Consistent spacing and typography
- [x] Professional color schemes

## 🚧 In Progress / Planned Features

### Resource Organizer (Next Phase)
- [ ] **Database Schema**
  - [x] Resource categories table created
  - [x] Resources table created
  - [ ] Migration applied to Supabase

- [ ] **Accordion Layout**
  - [ ] Category accordion component
  - [ ] Expandable category headers
  - [ ] Resource count display
  - [ ] Smooth expand/collapse animations

- [ ] **Resource Display**
  - [ ] Resource cards with name, URL, description
  - [ ] Clickable website links
  - [ ] Optional favicon/thumbnail display
  - [ ] Edit and delete buttons per resource

- [ ] **Add Resource Functionality**
  - [ ] Add resource modal/form
  - [ ] Category selection dropdown
  - [ ] Create new category option
  - [ ] URL validation
  - [ ] Favicon auto-fetch

- [ ] **Organization Features**
  - [ ] Search resources by name or category
  - [ ] Tag-based filtering
  - [ ] Alphabetical sorting
  - [ ] Sort by date added
  - [ ] Drag-and-drop reordering (future)

### Additional Enhancements
- [ ] **Security**
  - [ ] Master password for encryption key
  - [ ] Two-factor authentication
  - [ ] Session timeout settings

- [ ] **Data Management**
  - [ ] Automated backups
  - [ ] Bulk operations
  - [ ] Duplicate detection
  - [ ] Data import validation

- [ ] **UI Improvements**
  - [ ] Keyboard shortcuts
  - [ ] Advanced filtering
  - [ ] Custom views/layouts
  - [ ] Dashboard statistics

- [ ] **Integration**
  - [ ] Browser extension
  - [ ] Cloud vault integration (AWS Secrets Manager, HashiCorp Vault)
  - [ ] API for third-party tools

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom theme system
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Database Schema

### Current Tables

#### `api_keys`
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- service_name: text
- email_username: text
- encrypted_password: text (AES-256 encrypted)
- encrypted_api_key: text (AES-256 encrypted)
- notes: text
- tags: text[]
- created_at: timestamptz
- updated_at: timestamptz
```

#### `resource_categories` (Migration file created)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- name: text
- description: text
- icon: text
- created_at: timestamptz
- updated_at: timestamptz
```

#### `resources` (Migration file created)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- category_id: uuid (foreign key → resource_categories)
- name: text
- url: text
- description: text
- favicon_url: text
- tags: text[]
- created_at: timestamptz
- updated_at: timestamptz
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd api-key-manager
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations
Apply the migration files in `supabase/migrations/` to your Supabase project

5. Start the development server
```bash
npm run dev
```

6. Build for production
```bash
npm run build
```

## 🔐 Security Features

- **AES-256-GCM Encryption**: All passwords and API keys are encrypted client-side before storage
- **Row Level Security**: Database policies ensure users can only access their own data
- **Session-based Keys**: Encryption keys are generated per session and stored in sessionStorage
- **No Plaintext Storage**: Sensitive data is never stored or transmitted in plaintext
- **Automatic Cleanup**: Encryption keys are cleared on logout

## 📝 Usage

### Managing API Keys
1. Sign up or sign in to your account
2. Click "Add Key" to create a new API key entry
3. Enter service name, credentials, and any notes
4. Use tags to organize keys (e.g., "production", "test")
5. Use the eye icon to reveal sensitive data
6. Click copy to clipboard for quick access
7. Export your data for backup purposes

### Theme Switching
1. Click the theme icon in the navigation bar
2. Cycles through: Light → Dark → Emerald
3. Theme preference is saved automatically

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Icons from [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
