# Quick Start Guide - Easy Fashion POS

**Complete setup in 10 minutes** ⏱️

## What You Need

- Node.js (v18+)
- MySQL running
- Git

## Setup Steps

### 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd Technical-Assignment-POS-System
```

### 2️⃣ Create Database

Open phpMyAdmin (`http://localhost/phpmyadmin/`) and create database:

- Name: `technical_assignment_pos_system`
- Click "Create"

**That's it!** Tables will be created automatically.

### 3️⃣ Install Dependencies

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 4️⃣ Start Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run start:dev
```

Wait for: `Application is running on: http://localhost:4000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

### 5️⃣ Login

Open browser: `http://localhost:3000`

**Login credentials:**

- Email: `admin@gmail.com`
- Password: `admin`

**Done! 🎉**

**Done! 🎉**

---

## Common Problems & Quick Fixes

**Problem: "Cannot connect to database"**

- Check MySQL is running (open phpMyAdmin: `http://localhost/phpmyadmin/`)
- If your MySQL has a password, edit `backend/.env` and add it to `DB_PASSWORD=`

**Problem: "Port already in use"**

- Close other apps using port 4000 (backend) or 3000 (frontend)

**Problem: "Login not working"**

- Make sure both backend and frontend are running
- Clear browser cache (Ctrl+Shift+Delete)
- Use exact credentials: `admin@gmail.com` / `admin`

**Problem: "No products showing"**

- Restart backend server (it seeds products on first run)

**Problem: "npm install fails"**

- Check Node.js version: `node --version` (must be v18+)
- Try: `npm cache clean --force` then install again

---

## Database Schema File

To share database structure with others, give them this file:
**`database/complete-schema.sql`**

They can run it in phpMyAdmin:

1. Open phpMyAdmin → SQL tab
2. Copy all code from `complete-schema.sql`
3. Paste and click "Go"

---

## What's Included

After setup, you'll have:

- ✅ 1 Admin user (`admin@gmail.com` / `admin`)
- ✅ 4 Product categories
- ✅ 16 Sample products with images
- ✅ Full POS system ready to use

## Test It Works

1. Login with admin credentials
2. Go to POS page (click "New Order")
3. Add products to cart
4. Complete a sale
5. Check Sales History

**Everything working? Great! Start using the system! 🚀**

---

Need more details? See [README.md](README.md)
