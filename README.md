# Inventory Management UI

A modern React web application for inventory management with authentication and role-based access control.

## Features

- **Authentication**: JWT-based authentication with login and signup
- **Dashboard**: View all products in the inventory
- **Product Management** (Admin only): Add, edit, and delete products
- **User Management** (Admin only): View and manage users
- **Role-based Access Control**: Different permissions for ADMIN and USER roles
- **Responsive Design**: Modern, clean UI with responsive layouts

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API calls
- **JWT** for authentication
- **CSS** for styling

## Prerequisites

- Node.js 18+ and npm
- Backend API running (https://github.com/binathperera/agentic-inventory-management)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/binathperera/agentic-inventory-management-ui.git
   cd agentic-inventory-management-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set the backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

### USER
- View all products
- Search products
- View product details

### ADMIN
- All USER permissions
- Add new products
- Edit existing products
- Delete products
- Manage users (view, delete)

## API Integration

The application integrates with the Spring Boot backend API:
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/users` - Get all users (admin)
- `DELETE /api/users/:id` - Delete user (admin)

All authenticated requests include the JWT token in the `Authorization` header.

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── ProductModal.tsx
│   └── ProtectedRoute.tsx
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   └── UserManagement.tsx
├── services/        # API services
│   └── api.ts
├── styles/          # CSS files
│   ├── Auth.css
│   ├── Dashboard.css
│   ├── Modal.css
│   └── UserManagement.css
├── types/           # TypeScript types
│   └── index.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

