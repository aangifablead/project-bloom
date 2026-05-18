# Project Bloom - Advanced Project Management System

## Project Info

Project Bloom is a comprehensive project management system with both frontend and backend components. The system includes a React/TypeScript frontend and a robust Node.js/Express/MongoDB backend with advanced authentication and security features. Built with modern technologies, it features a clean dashboard interface with project tracking, task management, and team collaboration tools.

## How can I edit this code?

There are several ways of editing your application.

**Use Your Preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

Changes made to this repository will be reflected in your deployed application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repository and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project to any hosting platform that supports static React applications, such as Vercel, Netlify, or GitHub Pages. Follow your platform's standard deployment process for Vite/React applications.

## Project Features

Projectflow includes the following key features:

- Dashboard with project overview
- Project management with milestones
- Task tracking and assignment
- Team collaboration tools
- Responsive design for all devices
- Dark/light theme support

## Backend Architecture

The project also includes a robust backend system located in the `backend/` directory with:

- **Authentication System**: Register and login APIs with JWT authentication
- **User Management**: Complete user model with role-based access
- **Security Features**: Password hashing, account lockout, input validation
- **Logging**: Comprehensive winston-based logging system
- **Database**: MongoDB with Mongoose ODM
- **Future-Ready**: Architecture designed for refresh tokens, OAuth, RBAC, and audit logs

For detailed backend documentation, see `backend/README.md`.

### Backend Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Winston (logging)

### Getting Started with Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example in `backend/.env`

4. Start the development server:
   ```bash
   npm run dev
   ```
