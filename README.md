# Easy Fashion – Point-of-Sale System

A complete Point-of-Sale (POS) system built with **NestJS** (backend API), **Next.js** (frontend), and **MySQL** database. This application features authentication, role-based access control, product management, sales transactions, and comprehensive reporting.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Default Login](#default-login)
- [API Endpoints](#api-endpoints)
- [Database Tables](#database-tables)
- [Troubleshooting](#troubleshooting)

## Quick Setup

**New user?** See **[QUICK_START.md](QUICK_START.md)** for detailed guide (10 minutes).

### Fast Setup (5 steps)

```bash
# 1. Clone
git clone <repository-url>
cd Technical-Assignment-POS-System

# 2. Create database: technical_assignment_pos_system
# (in phpMyAdmin)

# 3-4. Install
cd backend && npm install
cd ../frontend && npm install

# 5. Run (2 terminals)
cd backend && npm run start:dev      # Terminal 1
cd frontend && npm run dev            # Terminal 2

# Open: http://localhost:3000
# Login: admin@gmail.com / admin
```

## Database Files

**`database/complete-schema.sql`** - Complete CREATE TABLE SQL

- Run this file to create all 6 tables manually
- **Share this file** for database migration

**`database/fresh-seed-reset.sql`** - Reset all data

- Clears all tables
- Restart backend to re-seed sample data

**Full guide:** [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Tech Stack

**Backend:** NestJS + TypeORM + MySQL + JWT Authentication  
**Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4

## Features

- Secure login (JWT tokens, password hashing)
- Role-based access (Admin, Cashier)
- Product management (CRUD with images)
- POS sales transactions
- Sales history and reports
- Dashboard with daily summary

## Default Login

**Email:** `admin@gmail.com`  
**Password:** `admin`

**⚠️ Change this password in production!**

## API Endpoints

**Backend:** `http://localhost:4000`

**Authentication:**

- `POST /auth/login` - Login with email/password

**Users (Admin):**

- `GET /users` - List all users
- `POST /users` - Create new cashier

**Products:**

- `GET /products` - List products (paginated)
- `GET /products/active` - Active products (for POS)
- `POST /products` - Create (Admin)
- `PATCH /products/:id` - Update (Admin)
- `DELETE /products/:id` - Delete (Admin)

**Sales:**

- `POST /sales` - Create new sale
- `GET /sales/history` - Sales history
- `GET /sales/dashboard/today` - Today's summary

**Authorization:** Include JWT token in header:

```
Authorization: Bearer <your-token>
```

## Frontend Pages

- **`/login`** - Login form
- **`/dashboard`** - Sales summary, quick actions (default home)
- **`/pos`** - Sales transactions with cart and tax calculation
- **`/products`** - Product management (Admin only)
- **`/users`** - User management (Admin only)
- **`/sales`** - Sales history and details

## Database Schema

**6 Tables:** `user`, `category`, `product`, `customer`, `sale`, `sale_item`

**Full schema with all table definitions:** [database/complete-schema.sql](database/complete-schema.sql)  
**Database setup guide:** [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Troubleshooting

**Backend won't start:**

- Check MySQL is running
- Verify `.env` database credentials
- Ensure database exists

**Port conflict:**

- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

**Can't login:**

- Clear browser localStorage
- Check backend logs
- Verify database has user table

**More help:** See [QUICK_START.md](QUICK_START.md) for common issues

---

**License:** Educational/Assignment purposes  
**Support:** See [QUICK_START.md](QUICK_START.md) or [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed help
