# 🍜 StreetLink

**Bridging the gap between street food vendors and hungry customers - digitally.**

StreetLink gives every street vendor a professional digital presence: manage your menu, track stock, accept UPI payments, and log earnings — all from a browser. Customers get a clean, fast discovery experience to find vendors near them without needing an app.

> Built with HTML · CSS · Vanilla JS · Firebase - no frameworks, no overhead.

---


## 🌍 The Problem

Street food vendors are one of India's most vibrant micro-economies, yet they're almost completely invisible online.

| Pain Point | Vendors | Customers |
|---|---|---|
| Discovery | No online presence, rely on foot traffic | Find out about vendors by accident or word-of-mouth |
| Payments | No digital payment system or receipts | Cash-only, no trust signals |
| Operations | No way to manage menu, stock, or earnings digitally | No way to check menu or availability before visiting |

**StreetLink solves all three - for both sides.**

---


## ✨ Core Features

### 👨‍🍳 For Vendors

| Feature | Details |
|---|---|
| 🏪 Stall Profile | Set up name, location, food category, UPI ID, Instagram, and profile photo |
| 📋 Menu Management | Add / edit / delete items with price, category, veg/non-veg tag, description, ingredients, and allergy info |
| 📦 Stock Tracking | Monitor ingredient/item quantities with unit types and **low-stock alerts** |
| 💳 UPI Payments | Auto-generate a QR code for any amount - customers scan and pay directly to your UPI ID |
| 💵 Cash Logging | Record cash transactions manually to keep all earnings in one place |
| 📊 Earnings Dashboard | View complete transaction history, filter by method, and export as CSV |
| 🟢 Open / Close Toggle | Let customers know your stall is active in real time |

### 🧑‍💻 For Customers

| Feature | Details |
|---|---|
| 🔍 Vendor Search | Search by stall name or food item |
| 🎛 Smart Filters | Filter by food type (veg/non-veg), rating, open status, and category |
| 🍽 Full Menu View | Browse complete menus with ingredient lists and allergy tags |
| 📍 Location Info | See where vendors are based |

---


## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS | Zero dependency overhead, fast loading |
| Auth | Firebase Authentication | Email/Password + Google Sign-In |
| Database | Cloud Firestore | Real-time updates, flexible schema |
| Storage | Firebase Storage | Vendor and food item images |
| Maps | Leaflet.js | Open-source, lightweight maps |
| Payments | QRCode.js | Client-side UPI QR generation |
| Typography | Syne + DM Sans | Modern, clean UI personality |

---


## 📁 Project Structure

```
streetlink/
|
|--- home_page.html            # Landing page
|--- login.html                # Auth — Email & Google Sign-In
|--- vendor_register.html      # New vendor onboarding
|
|--- vendors-dashboard.html    # Main vendor control panel
|--- vendors_menu.html         # Full menu overview
|--- vendors_add_item.html     # Add / edit menu items
|--- vendors_profile.html      # Edit stall profile
|--- vendors_stock.html        # Stock management
|--- vendors_payment.html      # UPI QR + cash payment logger
|--- vendors_earnings.html     # Transaction history & analytics
|
|--- customer.html             # Customer discovery interface
|
|--- firebase-app.js           # Firebase init + all backend logic
```

---


## 🗃 Firebase Data Model

```
/users/{uid}
  |--- role: "vendor" | "customer"
  |--- email: string
  |--- createdAt: timestamp

/vendors/{uid}
  |--- vendorName, stallName, about
  |--- location, phone, email, instagram
  |--- category, foodType (veg | nonveg | both)
  |--- upiId, imageUrl
  |--- rating, isOpen
  |--- createdAt: timestamp

  /menu/{itemId}
    |--- name, description, price
    |--- category, isVeg, foodType
    |--- ingredients: []
    |--- allergies: []
    |--- imageUrl, rating
    |--- createdAt: timestamp

  /stock/{itemId}
    |--- name, qty, unit
    |--- minLevel  ← triggers low-stock alert
    |--- category, notes
    |--- updatedAt, createdAt: timestamp

  /transactions/{txId}
    |--- amount: number
    |--- method: "upi" | "cash"
    |--- note: string
    |--- status: "success" | "pending"
    |--- createdAt: timestamp
```

---


## ⚙️ Getting Started

### Prerequisites
- A modern browser
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension
- A free [Firebase](https://console.firebase.google.com) account

### 1. Clone the repo

```bash
git clone https://github.com/WorkRohit17/streetlink.git
cd streetlink
```

### 2. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add Project**
2. Enable **Authentication** → Sign-in methods → ✅ Email/Password + ✅ Google
3. Enable **Firestore Database** → Start in test mode
4. Enable **Storage** → Start in test mode

### 3. Add your Firebase config

Open `firebase-app.js` and replace the config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Launch

```bash
# In VS Code:
Right click on home_page.html → "Open with Live Server"
```

---


## 🔐 User Roles & Flow

```
New User
  |
  |- Register as Vendor ──→ vendors-dashboard.html
  |     |- Manage: Menu · Stock · Payments · Earnings · Profile
  |
  |- Browse as Customer ──→ customer.html
        |-Search · Filter · View Menus · Find Vendors
```

---


## 💳 How UPI Payments Work

1. Customer selects items from a vendor's menu
2. Vendor enters the total amount in `vendors_payment.html`
3. StreetLink generates a **dynamic QR code** using the vendor's saved UPI ID
4. Customer scans with any UPI app (GPay, PhonePe, Paytm, etc.)
5. Transaction is logged automatically in the vendor's earnings history

> No payment gateway. No commission. Money goes **directly** to the vendor.

---


## 🌟 What Makes StreetLink Stand Out

- **Zero commission** - unlike aggregator platforms, vendors keep 100% of their revenue
- **No app required** - works entirely in the browser on any device
- **Real payment flow** - not a mockup; actual UPI QR codes that work with any UPI app
- **Complete business tool** - menu + stock + payments + earnings all in one place
- **Built for India** - UPI-first, designed for the way street vendors actually operate

---


## 🚧 Roadmap

- [ ] 📍 Google Maps - live vendor location pinning
- [ ] 🔔 Push notifications - order alerts for vendors
- [ ] 🌐 PWA support - install on home screen, offline mode
- [ ] 🤖 Smart recommendations - suggest vendors based on customer history
- [ ] ⭐ Customer reviews - ratings system for vendors and items
- [ ] 🌍 Multi-city support - city-based vendor discovery
- [ ] 🎨 UI v2 - Figma-based redesign

---


## 🤝 Contributing

```bash
# 1. Fork this repo
# 2. Create your branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

---


## 📜 License

This project is licensed under the **MIT License** - free to use, modify, and distribute.

---


## 👤 Author

**Rohit Bansal , Trusha , Manvi , Ranveer Singh**

Built to give street vendors a digital identity - and customers a better way to discover them.

---

*StreetLink - simple, practical, and built to grow.* 🚀
