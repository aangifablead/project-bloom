# Project Bloom 🌸

> **Advanced Project Management System**

Project Bloom is a full-stack project management application. It provides a robust backend API and a modern, responsive frontend for managing projects, tasks, and teams effectively.

## 🚀 Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State/Data Management:** React Query, React Hook Form, Zod
- **Drag & Drop:** `@dnd-kit`

### Backend
- **Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **Real-time:** Socket.IO
- **Utilities:** Morgan, Winston, Nodemailer, Octokit

---

## 📁 Repository Structure

```text
project-bloom-main/
├── backend/                  # Node.js / Express backend server
│   ├── src/                  # Backend source code
│   ├── package.json          # Backend dependencies
│   └── .env                  # Backend environment variables
├── frontend/                 # React / Vite frontend application
│   ├── src/                  # Frontend source code
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
├── API_Documentation.md      # API Reference and documentation
├── Postman_API_Collection.json # Postman collection for API testing
└── README.md                 # This file
```

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
- [MongoDB](https://www.mongodb.com/) (running locally or a cloud URI)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Ensure your `.env` file is properly configured with your `PORT`, MongoDB URI, JWT secrets, etc.
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or use bun install if you prefer
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit the URL provided in the terminal (usually `http://localhost:5173`).

---

## 📚 API Documentation

Detailed API documentation can be found in the [API_Documentation.md](./API_Documentation.md) file. You can also import the provided [Postman Collection](./Postman_API_Collection.json) into Postman to easily test the endpoints.

---

## 📄 License

This project is licensed under the MIT License - see the respective package.json files for details.
