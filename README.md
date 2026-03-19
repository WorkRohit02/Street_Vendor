StreetLink – README
What is this?
StreetLink is a web app that connects street food vendors with customers in their area. Vendors get a dashboard to manage their stall, menu, stock, payments, and earnings. Customers can browse vendors, search food items, and view menus — all without needing an app download.

Tech Stack

Frontend — Plain HTML, CSS, vanilla JavaScript (no frameworks)
Backend — Firebase (Auth, Firestore, Storage)
Fonts — Syne (headings) + DM Sans (body) via Google Fonts
Libraries — Leaflet.js (map on profile page), QRCode.js (payment QR generation)


Project Structure
├── home_page.html          — Landing page
├── login.html              — Login (email/password + Google)
├── vendor_register.html    — Vendor signup
├── vendors-dashboard.html  — Vendor dashboard (menu overview, stall toggle)
├── vendors_menu.html       — Full menu management with search
├── vendors_add_item.html   — Add new food item with ingredient picker
├── vendors_profile.html    — Vendor public profile + edit mode
├── vendors_stock.html      — Stock/ingredient tracking with low-stock alerts
├── vendors_payment.html    — UPI QR generator + cash payment logger
├── vendors_earnings.html   — Transaction history, charts, CSV export
├── customer.html           — Customer search (vendors + food items)
├── firebase-app.js         — All Firebase logic, auth, and page init

Firebase Collections
/users/{uid}
  role, email, createdAt

/vendors/{uid}
  vendorName, stallName, location, phone, email
  category, foodType, upiId, imageUrl
  rating, isOpen, instagram, about, createdAt

/vendors/{uid}/menu/{itemId}
  name, price, category, isVeg, foodType
  ingredients, allergies, description
  imageUrl, rating, createdAt

/vendors/{uid}/stock/{itemId}
  name, qty, unit, minLevel, category, notes
  updatedAt, createdAt

/vendors/{uid}/transactions/{txId}
  amount, method (upi | cash), note, status, createdAt

Features
Vendor side:

Register stall with name, location, phone, UPI ID, food category
Toggle stall open/closed from dashboard
Add/edit/delete menu items with allergy tags and ingredients from stock
Stock manager with low-stock banner and quick +/- quantity buttons
Generate UPI QR codes per order amount, or log cash payments
Earnings page with weekly bar chart, UPI vs cash breakdown, pagination, CSV export
Profile page with inline edit for contact info, Instagram, UPI ID

Customer side:

Search vendors and food items with filters (veg only, rating, status, category)
Slide-out drawer showing full vendor menu with allergen info and descriptions


Getting Started

Clone the repo
Add your own firebase-app.js with your Firebase project config, or replace the config object inside the existing one
Enable Email/Password and Google sign-in in Firebase Auth
Set up Firestore with the collection structure above
Open any .html file via a local server (e.g. VS Code Live Server) — direct file:// won't work with ES modules
