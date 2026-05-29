# ZenAxis Store

This project is a React-based web application for the ZenAxis store, specializing in CNC machine components and automation technology.

## Tech Stack
- **Frontend:** React (v19)
- **Styling:** Custom CSS (`App.css`)
- **Persistence:** LocalStorage (for products, orders, users, and settings)
- **Deployment/Scripts:** react-scripts (Create React App)

## Project Structure
The application follows a monolithic structure where most of the logic and components reside within `src/App.js`.

- `src/App.js`: Contains the main application logic and sub-components:
  - `Navbar`: Navigation and theme toggling.
  - `Home`: Main landing page with category filtering and Hero slider.
  - `ProductDetails`: Detailed view for individual products.
  - `Services`: Machine servicing information.
  - `Cart`: Shopping cart management.
  - `Checkout`: Secure checkout process with manual payment verification (bKash, Nagad, etc.).
  - `AuthPage`: Login and Registration system.
  - `AdminPanel`: Management dashboard for admins (Products, Orders, Categories, Users).
  - `CustomerDashboard`: User-specific dashboard for order history and profile management.
- `src/App.css`: Global and component-specific styles.
- `src/ZenAxis Logo.png`: Main brand logo used in the app.

## Key Features
- **Admin Dashboard:** Full CRUD operations for products, order status management, and user auditing.
- **Customer Accounts:** Registration, login, and personalized order history.
- **Product Gallery:** Support for multiple images, hot deal badges, and technical specifications.
- **Dark Mode:** System-wide theme toggling persisted in localStorage.
- **Responsive Design:** Mobile-friendly navigation and layout.
- **WhatsApp Integration:** Floating chat button and direct links for service inquiries.

## Data Persistence
The app uses `localStorage` with versioned keys (e.g., `zen_products_v15`) to ensure data persists across sessions.
- `defaultAdminUser`: A pre-configured admin account (`admin@gmail.com` / `admin123`).

## Getting Started

### Development
```bash
npm start
```
Runs the app at [http://localhost:3000](http://localhost:3000).

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## Workflow
- **Always Active:** Ensure the development server is running in the background during and after work sessions.
- **Verification:** Regularly check `npm start` output to confirm successful compilation.

## Conventions
- **Component Design:** Components are currently bundled in `App.js`. For future scaling, consider extracting them into separate files in `src/components/`.
- **State Management:** React `useState` and `useEffect` hooks are used for local state management and synchronization with `localStorage`.
- **Formatting:** Currency is formatted in BDT using `formatBDT` utility.
