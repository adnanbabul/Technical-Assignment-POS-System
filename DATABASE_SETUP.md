# Database Setup Guide

Simple guide to set up the database for Easy Fashion POS.

## Quick Info

- **Database Name:** `technical_assignment_pos_system`
- **Tables:** 6 tables
- **Auto-created:** Yes (when you start backend)

## How to Set Up

### Option 1: Automatic (Recommended) ⭐

**Just create an empty database:**

1. Open phpMyAdmin: `http://localhost/phpmyadmin/`
2. Click "Databases"
3. Enter name: `technical_assignment_pos_system`
4. Click "Create"
5. Start backend: `npm run start:dev`

**Done!** Tables are created automatically.

### Option 2: Manual SQL

**Run the SQL file:**

1. Open phpMyAdmin → SQL tab
2. Open file: `database/complete-schema.sql`
3. Copy all SQL code
4. Paste in SQL tab
5. Click "Go"

**Done!** All tables created.

## Configuration

Edit `backend/.env` if needed:

```env
DB_USER=root
DB_PASSWORD=          # Add your MySQL password here
DB_NAME=technical_assignment_pos_system
```

## Database Files

**`database/complete-schema.sql`** ⭐ **MOST IMPORTANT**

- Complete database schema
- Use this to create tables manually
- **Share this file** with other developers

**`database/fresh-seed-reset.sql`**

- Clears all data
- Run this to start fresh
- Then restart backend to re-seed

## What Gets Created

| Table       | What It Stores             |
| ----------- | -------------------------- |
| `user`      | Admin and cashier accounts |
| `category`  | Product categories         |
| `product`   | Products for sale          |
| `customer`  | Customer information       |
| `sale`      | Sales transactions         |
| `sale_item` | Items in each sale         |

## Verify Setup

Check tables exist:

```sql
USE technical_assignment_pos_system;
SHOW TABLES;
```

Should show 6 tables.

Should show 6 tables.

## Common Problems

**"Cannot connect to database"**

- Check MySQL is running
- Verify database name is correct
- Check password in `backend/.env`

**"Table doesn't exist"**

- Restart backend server
- Or run `database/complete-schema.sql`

**"Tables are empty"**

- Restart backend (it seeds data on first run)
- Or use `database/fresh-seed-reset.sql` then restart

## Share Database Schema

To give schema to another person:

**Option 1:** Send them `database/complete-schema.sql` file

**Option 2:** Export from phpMyAdmin:

1. Select database
2. Click "Export" → Quick → SQL
3. Click "Go"
4. Share the downloaded file

---

**Need help?** See [QUICK_START.md](QUICK_START.md) for full setup guide.
