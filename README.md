****StreetLink - README
**

****What is this?
**
StreetLink is a web app that connects street food vendors with customers in their area. Vendors get a dashboard to manage their stall, menu, stock, payments, and earnings. Customers can browse vendors, search for food items, and view menus all without needing an app download.
The goal is simple to make street food easier to find, trust, and pay for

****What makes it different
****

• This is not just a static listing project. It actually works like a real system
• Vendors can add their UPI ID  
• QR codes are generated dynamically for each payment  
• Customer side reads live vendor data from the database
• The entire flow feels real and usable, not just a demo

****The idea
****

•	Street vendors are everywhere but hard to find online  
•	There is no proper system for menus, payments, or stock  
•	Finding local vendors is tough since people usually depend on word of mouth  
•	Without any trusted sources, customers just ask around to find local vendors

StreetLink solves this by giving vendors a simple digital presence and giving customers a clean way to explore food options nearby

****How it works
****

Vendor side:
•	Create and manage stall profile  
•	Add and update menu items  
•	Track stock and get low stock alerts  
•	Generate UPI QR codes for payments  
•	Log cash payments  
•	View earnings and transaction history

Customer side:
•	Search vendors and food items  
•	Filter based on veg, rating, or availability  
•	View full menus with details  
•	Choose vendors with more clarity

****Tech Stack
****

Frontend: Plain HTML, CSS, vanilla JavaScript (no frameworks)
Backend: Firebase (Auth, Firestore, Storage)
Fonts: Syne (headings) + DM Sans (body) via Google Fonts
Libraries: Leaflet.js (map on profile page), QRCode.js (payment QR generation) 

****Project Structure
****

├── home_page.html          - Landing page
├── login.html              - Login (email/password + Google)
├── vendor_register.html    - Vendor signup
├── vendors-dashboard.html  - Vendor dashboard (menu overview, stall toggle)
├── vendors_menu.html       - Full menu management with search
├── vendors_add_item.html   - Add new food item with ingredient picker
├── vendors_profile.html    - Vendor public profile + edit mode
├── vendors_stock.html      - Stock/ingredient tracking with low-stock alerts
├── vendors_payment.html    - UPI QR generator + cash payment logger
├── vendors_earnings.html   - Transaction history, charts, CSV export
├── customer.html           - Customer search (vendors + food items)
├── firebase-app.js         - All Firebase logic, auth, and page init

****Firebase Collections
****

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

****Features**
**

Vendor side:
•	Register stall with name, location, phone, UPI ID, food category  
•	Toggle stall open or closed from dashboard  
•	Add edit delete menu items with allergy tags and ingredients from stock  
•	Stock manager with low-stock alerts and quick quantity updates  
•	Generate UPI QR codes for orders or log cash payments  
•	Earnings page with weekly charts, UPI versus cash breakdown, pagination, CSV export  
•	Profile page with inline edit for contact info, Instagram, and UPI ID


Customer side:
•	Search vendors and food items with filters veg only, rating, status, category  
•	Slide-out menu drawer showing full vendor menu with ingredient and allergy info

****Getting Started
****

• Clone the repo
•	Add your own firebase-app.js with your Firebase project config or replace the config object inside the existing one
•	Enable Email Password and Google sign-in in Firebase Auth
•	Set up Firestore with the collection structure above
•	Open any HTML file via a local server such as VS Code Live Server. Direct file access will not work with ES modules

**Why this stands out**
•	It solves a real problem  
•	It is usable end to end  
•	It shows actual payment flow  
•	It focuses on small businesses, not just users
Unlike traditional delivery apps, our system sends payment directly to the vendor's bank account via UPI, eliminating platform commission

**Future improvements**
•	Add Google Maps for exact vendor location  
•	Improve UI using a structured Figma design system  
•	Turn it into a Progressive Web App for an app like experience  
•	Add smarter search and recommendations  
•	Expand to multiple cities
StreetLink is a small step toward making street vendors more visible and independent  
It is simple, practical, and ready to grow
