# 🎫 Tickets Webshop

A modern ticket booking system for sports and e-sports events built with Node.js, Express, and MySQL.



link 

https://tickets-webshop.onrender.com/
## 🚀 Features

- **Event Browsing**: Browse tickets by categories (Football, Basketball, Tennis, Hockey, E-sports)
- **User Authentication**: Login/Register system with role-based access
- **Admin Panel**: Complete admin interface for managing tickets, categories, and users
- **Order Management**: Full order processing and management system
- **Responsive Design**: Mobile-friendly interface
- **Secure**: Password hashing, SQL injection protection, and secure sessions

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL (compatible with various hosting providers)
- **Authentication**: bcrypt for password hashing
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **File Upload**: Multer for profile images

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickets_webshop-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Update database credentials in `db.js`
   - Current configuration uses: `sql7.freesqldatabase.com`
   - Import the database schema from `LoginSystem/backup/`

4. **Start the application**
   ```bash
   npm start
   # or
   node index.js
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:3002`

## 🗂️ Project Structure

```
tickets_webshop-1/
├── public/                 # Static files (CSS, JS, images)
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── images/            # Image assets
├── routes/                # Express route handlers
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin panel routes
│   ├── tickets.js        # Ticket management routes
│   └── orders.js         # Order processing routes
├── LoginSystem/          # Authentication system
│   └── backup/           # Database backups
├── db.js                 # Database configuration
├── index.js              # Main application file
└── package.json          # Dependencies and scripts
```

## 🎯 Available Routes

### Public Routes
- `GET /` - Homepage with featured tickets
- `GET /tickets.html` - All tickets page
- `GET /category/:id` - Category-specific tickets
- `GET /ticket/:id` - Individual ticket details

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### API Endpoints
- `GET /api/tickets` - Get all tickets
- `GET /api/categories` - Get all categories
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/orders` - Create new order

### Admin Routes (requires admin authentication)
- `GET /admin` - Admin dashboard
- Admin CRUD operations for tickets, categories, and users

## 🎫 Event Categories

1. **Voetbal (Football)** - Premier League, Champions League, World Cup
2. **Basketbal (Basketball)** - NBA Finals, March Madness, EuroLeague
3. **Tennis** - Wimbledon, US Open, French Open
4. **Hockey** - NHL Stanley Cup, Olympics, College Championships
5. **E-sports** - Counter Strike, Rainbow Six, Rocket League, Valorant

## 👥 User Roles

- **Admin**: Full access to all features and admin panel
- **Moderator**: Limited admin access
- **User**: Standard customer access for browsing and purchasing


