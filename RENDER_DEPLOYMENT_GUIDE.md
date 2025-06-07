# Render.com Deployment Guide - Tickets Webshop

## 🚨 Important: Database Options for Render.com

Render.com **does NOT support MySQL** - only PostgreSQL. Here are your options:

## Option 1: Use PostgreSQL on Render (Recommended)

### Step 1: Convert MySQL to PostgreSQL
1. Install PostgreSQL conversion tool:
   ```bash
   npm install pg
   ```

2. Update your database connection in `db.js`:
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   });
   ```

### Step 2: Environment Variables on Render
In your Render dashboard, add these environment variables:

| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `[Render will auto-provide this]` |
| `PORT` | `10000` |

### Step 3: PostgreSQL Schema Conversion
Your MySQL schema needs to be converted. Here's the PostgreSQL version:

```sql
-- PostgreSQL version of your database
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    img_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role_id INTEGER DEFAULT 3 REFERENCES roles(id),
    profile_img VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    img_url VARCHAR(255),
    quantity_available INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    guest_first_name VARCHAR(50),
    guest_last_name VARCHAR(50),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    guest_name VARCHAR(100),
    guest_postcode VARCHAR(20),
    guest_street VARCHAR(100),
    guest_housenumber VARCHAR(20),
    guest_city VARCHAR(100),
    order_notes TEXT,
    total_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'in behandeling',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    ticket_id INTEGER REFERENCES tickets(id),
    quantity INTEGER,
    price DECIMAL(8,2)
);
```

## Option 2: Use External MySQL Service

### Popular MySQL Cloud Services:
1. **PlanetScale** (Free tier available)
2. **Amazon RDS MySQL**
3. **Google Cloud SQL**
4. **Railway** (supports MySQL)

### Environment Variables for External MySQL:
| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | `your-mysql-host.com` |
| `DB_USER` | `your-username` |
| `DB_PASSWORD` | `your-password` |
| `DB_NAME` | `sport_tickets` |
| `PORT` | `10000` |

## Option 3: Use Railway (Supports MySQL)

Railway.app supports MySQL directly and might be easier for your current setup.

## 🚀 Render Deployment Steps

### 1. In Render Dashboard:
- Connect your GitHub repository
- Choose "Web Service"
- Set Build Command: `npm install`
- Set Start Command: `npm start`

### 2. Environment Variables (as shown in your screenshot):
```
NODE_ENV=production
DATABASE_URL=[auto-provided for PostgreSQL]
PORT=10000
```

### 3. Build Commands:
```bash
# Build Command
npm install --production

# Start Command  
npm start
```

## 📱 What Needs to Change in Your Code

### For PostgreSQL (Option 1):
1. Replace `mysql2` with `pg` in package.json
2. Update connection code in `db.js`
3. Convert AUTO_INCREMENT to SERIAL
4. Update enum types

### For External MySQL (Option 2):
1. Update environment variables in `db.js`
2. Use connection string format for external service

## 🔄 Database Migration Commands

### For PostgreSQL on Render:
1. Create tables via Render's PostgreSQL console
2. Insert your sample data
3. Your app will connect automatically

### For External MySQL:
1. Import your existing `.sql` file to the external service
2. Update connection settings in your app

## 🎯 Recommendation

**Use PostgreSQL on Render** - it's free, integrated, and will work seamlessly with your deployment.

Would you like me to help convert your MySQL code to PostgreSQL? 