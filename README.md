# Inventory Management System — Frontend

A modern, responsive **Inventory Management System frontend** built with React and TypeScript. The application provides an intuitive interface for managing products, inventory, suppliers, categories, purchases, sales, and users through a role-based dashboard.

## Table of Contents

* [Project Overview](#project-overview)
* [Screenshots](#screenshots)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Environment Variables](#environment-variables)
  * [Run Locally](#run-locally)
  * [Build for Production](#build-for-production)
* [Authentication & Authorization](#authentication--authorization)
* [API Integration](#api-integration)
* [Deployment](#deployment)
* [Future Improvements](#future-improvements)
* [License](#license)

---

## Project Overview

The Inventory Management System is a web-based application designed to simplify inventory and business operations.

The frontend provides a responsive dashboard where authorized users can manage products, categories, suppliers, purchases, sales, and stock levels. It communicates with a RESTful backend API for authentication, data management, and business operations.

The interface is designed with a focus on **usability, responsive design, reusable components, and role-based access control**.

---

## Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Product Management

![Products](./screenshots/products.png)

### Stock Management

![Stock Management](./screenshots/stock-management.png)

> Add your actual screenshots to the `screenshots` folder and update the image names if necessary.

---

## Features

### Authentication

* User login and logout
* JWT-based authentication
* Protected routes
* Persistent authentication state
* Automatic handling of unauthorized requests

### Dashboard

* Overview of inventory statistics
* Total products
* Stock summary
* Purchase and sales overview
* Low-stock alerts
* Role-based dashboard access

### Product Management

* Create products
* View product list
* Update product information
* Delete products
* Product search
* Product filtering
* Pagination
* Product category and supplier association

### Inventory Management

* Track current stock
* Incoming stock from purchases
* Outgoing stock from sales
* Stock adjustments
* Low-stock identification

### Supplier Management

* Add suppliers
* View supplier information
* Update supplier details
* Delete suppliers
* Search and filter suppliers

### Category Management

* Create categories
* Update categories
* Delete categories
* View products by category

### Purchase & Sales

* Create purchase orders
* Record incoming inventory
* Create sales orders
* Track outgoing inventory
* View order history

### User & Role Management

* Role-based access control
* Admin dashboard
* User management
* Permission-based UI rendering

### UI/UX

* Responsive design
* Reusable components
* Loading states
* Error handling
* Confirmation dialogs
* Form validation
* Search and filtering
* Pagination
* Clean dashboard interface

---

## Tech Stack

### Frontend

* **React**
* **TypeScript**
* **React Router**
* **Tailwind CSS**

### State Management

* **Context API**
* **Redux Toolkit / RTK Query** *(remove if not used)*

### API & Data Handling

* **Axios**
* REST API integration

### Form & Validation

* **React Hook Form** *(remove if not used)*
* **Zod** *(remove if not used)*

### UI & Utilities

* **Lucide React** *(if used)*
* **SweetAlert2** *(if used)*

### Development Tools

* Git
* GitHub
* ESLint
* Prettier
* Vite

---

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> Update the structure above to match the actual project structure.

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js 18+
* npm
* Git

You will also need access to the Inventory Management System backend API.

---

## Installation

Clone the repository:

```bash
git clone [https://github.com/nshakib/inventory-management-system.git](https://github.com/nshakib/inventory-management-system-frontend.git)
```

Navigate to the frontend directory:

```bash
cd inventory-management-system-frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the frontend root directory.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, use the deployed backend API URL:

```env
VITE_API_URL=https://your-backend-api-url.com/api
```

> Never commit `.env` files containing sensitive information.

---

## Run Locally

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# Authentication & Authorization

The frontend uses JWT-based authentication to communicate securely with the backend API.

The application provides:

* Login/logout functionality
* Protected routes
* Authentication state management
* Role-based navigation
* Role-based UI access
* Unauthorized access handling

Supported roles include:

* **Admin**
* **User**
* **Supplier**

> Update the roles above if your actual application uses different roles.

---

# API Integration

The frontend communicates with the backend through RESTful API endpoints.

The API integration handles:

* Authentication
* Products
* Categories
* Suppliers
* Purchases
* Sales
* Stock
* Users
* Dashboard statistics

Example API configuration:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

API requests are organized into reusable service/API modules to keep data-fetching logic separate from UI components.

---

# Deployment

The frontend can be deployed using platforms such as:

* Vercel
* Netlify

### Live Demo

**Live Application:** [Add your deployed frontend URL here]

### Backend API

**API:** [Add your deployed backend URL here]

---

# Future Improvements

* Advanced inventory analytics
* Real-time stock updates
* Barcode and QR code scanning
* Bulk product import/export
* Multi-warehouse inventory
* Advanced sales and purchase reports
* Product image management
* Notification system
* Dark/light theme
* Improved dashboard analytics
* Export reports to PDF/Excel
* Advanced permission management

---

# License

This project is licensed under the MIT License.

---

## Related Links

* **Live Demo:** Add your deployed frontend URL
* **Backend Repository:** Add backend repository URL
* **API Documentation:** Add API documentation URL if available
* **Portfolio:** https://nazmusshakib.dev
* **LinkedIn:** https://www.linkedin.com/in/nazmus-shakib/
