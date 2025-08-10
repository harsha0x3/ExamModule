import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import ExamPage from "./features/exam/ExamPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <nav style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1>Exam App</h1>
                <p>Use the dashboard to start an exam.</p>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam/:sessionId" element={<ExamPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
