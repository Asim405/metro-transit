# 🚀 MetroTransit Live - Quick Start Guide

## ⚡ 5-Minute Setup

### What You're Getting

✅ **Full-Stack Transit Management System**
- MySQL Database with 3rd Normal Form (3NF) design
- Express.js Backend with ACID transactions
- React Native Frontend with NativeWind styling
- BONUS: Database triggers, views, sample data

---

## 📋 Prerequisites

Install these first:

1. **MySQL** (v5.7 or higher)
   - Download: https://dev.mysql.com/downloads/mysql/

2. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

3. **Git** (Optional, for version control)
   - Download: https://git-scm.com/

---

## 🏃 Quick Start (3 Terminals)

### Terminal 1: Database Setup

```bash
# Navigate to project folder
cd MetroTransit-Live

# Setup database (one-time only)
mysql -u root -p metro_transit_db < database/database_setup.sql

# Enter your MySQL password when prompted
```

**Expected Output:**
```
Query OK, X rows affected
Query OK, X rows affected
... (multiple lines)
```

✅ Database ready!

---

### Terminal 2: Start Backend

```bash
cd backend

# First time only
npm install

# Start server
npm start
```

**Expected Output:**
```
✓ Database connection established
✓ Database models synchronized
========================================
✓ Metro Transit Live Backend
✓ Server running on http://localhost:5000
========================================
```

✅ Backend running!

---

### Terminal 3: Start Frontend

```bash
cd frontend

# First time only
npm install

# Start Expo
npm start
```

**Follow Expo menu:**
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Press `w` for Web Browser
- Or scan QR code with Expo Go app (physical device)

✅ Frontend running!

---

## 🧪 Test It Out

### In Browser Terminal 1:

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Metro Transit Live Backend is running"
}
```

### In Browser Terminal 1:

```bash
curl http://localhost:5000/api/schedules
```

Should return list of 5 available schedules with all details.

### In App (Terminal 3):

1. See list of schedules
2. Click "BOOK NOW" on any schedule
3. Select 2 seats
4. Click "PROCEED TO PAYMENT"
5. Confirm booking
6. Go to "My Bookings" tab to see your reservation

✅ All working!

---

## 📁 Project Structure

```
MetroTransit-Live/
│
├── 📄 README.md                          ← Full documentation
├── 📄 PROJECT_SUMMARY.md                 ← Detailed explanation
├── 📄 SETUP_COMMANDS.txt                 ← All commands reference
├── 📄 QUICK_START.md                     ← This file
│
├── 📁 database/
│   └── database_setup.sql                ← 3NF schema, triggers, views
│
├── 📁 backend/
│   ├── index.js                          ← Express + Sequelize
│   ├── package.json                      ← Dependencies
│   ├── .env.example                      ← Config template
│   └── node_modules/                     ← Installed packages
│
└── 📁 frontend/
    ├── App.js                            ← React Native app
    ├── app.json                          ← Expo config
    ├── package.json                      ← Dependencies
    ├── .env.example                      ← Config template
    └── node_modules/                     ← Installed packages
```

---

## 🔑 Key Features

### 🗄️ Database
- ✅ 5 tables in 3NF
- ✅ Automatic seat deduction trigger
- ✅ Active schedules view
- ✅ 5 sample schedules ready to book

### 💻 Backend API
- ✅ 6 RESTful endpoints
- ✅ ACID transaction safety
- ✅ Seat availability checking
- ✅ Payment simulation

### 📱 Frontend UI
- ✅ Schedule browsing
- ✅ Seat selection
- ✅ Booking management
- ✅ Minimalist design with high contrast

---

## 🎯 Demo Credentials

### Test Users

**User ID 1 (John Doe)**
- Email: john@example.com
- Password: (any for now)

**User ID 2 (Jane Smith)**
- Email: jane@example.com

**User ID 3 (Robert Johnson)**
- Email: robert@example.com

### Sample Routes

1. **NY Express Line** (Bus)
   - Central Station → Grand Central
   - $15 per seat

2. **City Metro Line 1** (Metro)
   - Grand Central → Penn Station
   - $22.50 per seat

3. **Bay Area Express** (Bus)
   - Union Square → Ferry Terminal
   - $12 per seat

4. **Cross City Line** (Train)
   - Central Station → Penn Station
   - $35 per seat

---

## 🐛 Troubleshooting

### "Cannot connect to database"

**Fix:**
1. Make sure MySQL is running
2. Check credentials in backend/.env
3. Verify database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'metro_transit_db';"
   ```

### "Port 5000 already in use"

**Fix (Windows PowerShell):**
```bash
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

**Fix (Mac/Linux):**
```bash
lsof -ti:5000 | xargs kill -9
```

### "Frontend cannot connect to backend"

**For Android Emulator:**
- Already configured to use `http://10.0.2.2:5000`

**For Physical Device:**
- Edit `frontend/.env`
- Change to your PC's IP:
  ```
  REACT_APP_API_BASE_URL=http://192.168.x.x:5000
  ```

### "npm install takes too long"

**Normal** - First install takes 5-10 minutes
Just wait, don't interrupt!

---

## 📚 Understanding the Tech

### What is 3NF?

**3rd Normal Form** = Organized database to avoid:
- ❌ Duplicate data
- ❌ Update anomalies
- ❌ Deletion anomalies

**This Project** ✅ Uses proper 3NF design with:
- Users, Stations, Routes, Schedules, Bookings
- Each table stores one concept
- No redundant data

### What is ACID?

**ACID** = Transaction safety guarantee:
- **A**tomicity: All or nothing (booking + seat deduction together)
- **C**onsistency: Database always valid
- **I**solation: No interference between bookings
- **D**urability: Changes persist forever

**This Project** ✅ Implements full ACID with:
- SERIALIZABLE isolation level
- Row-level locking
- Automatic rollback on error

### What is React Native?

**React Native** = Write once, run on iOS/Android
- Uses JavaScript/JSX
- Component-based like React
- NativeWind provides Tailwind styling

**This Project** ✅ Uses:
- Expo for easy setup
- React Navigation for tabs
- NativeWind for beautiful styling

---

## 🎓 Learning Path

### Day 1: Database
1. Read the database_setup.sql comments
2. Understand the 5 tables and relationships
3. Check the trigger for seat deduction
4. View the Active_Schedule_View

### Day 2: Backend
1. Start backend server (npm start)
2. Test endpoints with curl commands
3. Follow the ACID transaction flow in index.js
4. Understand Sequelize model relationships

### Day 3: Frontend
1. Run frontend on emulator/device
2. Browse through the app screens
3. Create a test booking
4. Check the code structure in App.js

### Day 4: Integration
1. Modify sample data
2. Add more stations/routes
3. Experiment with API endpoints
4. Try edge cases (overselling, etc.)

---

## 💡 Pro Tips

### Tip 1: Monitor Database

Keep this in another terminal to watch changes:
```bash
watch -n 1 'mysql -u root -p metro_transit_db -e "SELECT * FROM Schedules;"'
```

### Tip 2: Reset Everything

Start fresh anytime:
```bash
# Delete node_modules
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json

# Reset database
mysql -u root -p metro_transit_db < database/database_setup.sql

# Reinstall
cd backend && npm install && npm start

# (in new terminal)
cd frontend && npm install && npm start
```

### Tip 3: Test Different Scenarios

Try these bookings to test the system:
1. Book 1 seat (should work)
2. Book 50 seats (all remaining, should work)
3. Book 100 seats (more than available, should fail)
4. Book for same schedule twice (tests concurrency)

---

## 📖 Documentation

**Read these files in order:**

1. **QUICK_START.md** ← You are here
2. **README.md** ← Full documentation
3. **PROJECT_SUMMARY.md** ← Technical deep-dive
4. **SETUP_COMMANDS.txt** ← All commands reference

---

## ✨ What Makes This Project Special

### ✅ Production-Ready Code
- Proper error handling
- Input validation
- Transaction safety
- Scalable architecture

### ✅ Best Practices
- 3NF database normalization
- ACID transaction implementation
- RESTful API design
- Component-based UI

### ✅ Real-World Features
- Seat booking with concurrency control
- Payment simulation
- User management
- Booking history

### ✅ Educational Value
- Clear code comments
- Comprehensive documentation
- Multiple design patterns
- Full-stack example

---

## 🎯 Next Steps

### After Getting It Running:

1. **Explore the Code**
   - backend/index.js (ACID transaction logic)
   - frontend/App.js (Navigation & screens)
   - database/database_setup.sql (Schema design)

2. **Try Modifications**
   - Add more stations
   - Create additional routes
   - Adjust pricing
   - Add new features

3. **Understand the Concepts**
   - Why 3NF normalization?
   - How do triggers work?
   - What makes ACID important?
   - How does React Native work?

4. **Deploy It**
   - To cloud (AWS, Google Cloud, Azure)
   - To app stores (Play Store, App Store)
   - With authentication (JWT tokens)
   - With real payment (Stripe, PayPal)

---

## 🎉 You're Ready!

Everything is set up and ready to run. Just follow the 3-terminal setup above and you'll have a complete, production-grade transit management system running in minutes!

**Questions?** Check README.md or PROJECT_SUMMARY.md

**Happy coding!** 🚀

---

**MetroTransit Live v1.0.0** | Full-Stack Demo | Ready for Learning & Deployment
