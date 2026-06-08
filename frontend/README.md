# Full-Stack Post Management Application

A modular, scalable full-stack application built with a **Layered Architecture/MVC** design pattern on the backend using **FastAPI**, and a routed single-page interface on the frontend using **React (Vite + TailwindCSS)**.

---

## 📂 Project Architecture

The codebase enforces a strict separation of concerns, ensuring high maintainability and testability:

```text
post-management-app/
├── backend/                  # FastAPI Application Layer
│   ├── controllers/
│   │   └── posts.py          # Business logic & state manipulation
│   ├── routers/
│   │   └── posts.py          # HTTP transport layer & endpoint mapping
│   ├── main.py               # App initialization & CORS configurations
│   └── requirements.txt      # Backend dependencies
│
├── frontend/                 # React SPA (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/       # Reusable presentational components (Navbar)
│   │   ├── pages/            # View/Route-level components (Home, CreatePost)
│   │   ├── App.jsx           # React Router client-side definition
│   │   └── index.css         # Global styles & Tailwind directives
│   └── package.json          # Frontend dependencies & configurations