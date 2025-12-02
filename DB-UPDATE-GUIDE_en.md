# Database Schema Update Guide

This guide explains how to apply database schema changes in the JobMongolia project.

## Quick Update (Recommended)

After modifying the schema file (`shared/schema.ts`):

```bash
npm run db:update
```

This command will:
- Automatically connect to the database
- Compare current schema with database structure
- Apply only the differences automatically
- Output result report

## Available Database Commands

### 1. Immediate Schema Application (Development)
```bash
npm run db:update
# or
npm run db:push
```

### 2. Generate Migration Files Then Apply (Production)
```bash
npm run db:migrate
```

### 3. Open Database Management UI
```bash
npm run db:studio
```

## Manual Update Method

If automatic scripts fail:

### 1. Direct PostgreSQL Connection
```bash
psql -h 192.168.0.171 -p 5432 -U jobmongolia_user -d jobmongolia
```

### 2. Using Drizzle Kit
```bash
npx drizzle-kit push --force
```

## Schema Change Process

1. **Modify `shared/schema.ts` file**
   - Add/modify/delete tables and columns
   - Change relationship settings
   - Add constraints

2. **Apply Changes**
   ```bash
   npm run db:update
   ```

3. **Update Backend Code**
   - Modify queries in `server/postgresql-storage.ts`
   - Update related logic in `server/auth.ts` etc.

4. **Update Frontend Code**
   - Modify Form components
   - Update API call sections

## Safety Guidelines

### Development Environment
- Free to use `npm run db:update`
- Database reset possible if issues occur

### Production Environment
- Must use `npm run db:migrate`
- Version control through migration files
- Apply after backup

## Troubleshooting

### Connection Failure
- Automatically tries 203.23.49.100 if 192.168.0.171 fails
- Check network connection status

### Schema Conflicts
```bash
# Check existing schema status
npx drizzle-kit introspect

# Force apply
npx drizzle-kit push --force
```

### Migration Conflicts
```bash
# Check migration status
npx drizzle-kit status

# Apply specific migration
npx drizzle-kit migrate --to=0001
```

## Example: Adding New Column

1. **Schema Modification**
   ```typescript
   // shared/schema.ts
   export const users = pgTable("users", {
     // ... existing columns ...
     newColumn: text("new_column"),
   });
   ```

2. **Database Update**
   ```bash
   npm run db:update
   ```

3. **Backend Modification**
   ```typescript
   // server/postgresql-storage.ts
   async createUser(user: InsertUser): Promise<User> {
     // Modify INSERT query with newColumn added
   }
   ```

4. **Frontend Modification**
   ```typescript
   // client/src/pages/register.tsx
   const [formData, setFormData] = useState({
     // ... existing fields ...
     newColumn: "",
   });
   ```

## Common Patterns

### Adding New Table
```typescript
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Modifying Existing Column
```typescript
// Required → Optional
username: text("username"), // Remove .notNull()

// Add default value
status: text("status").default("active"),

// Add constraints
email: text("email").notNull().unique(),
```

Follow this guide to manage database schema safely and efficiently! 