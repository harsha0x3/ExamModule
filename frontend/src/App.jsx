import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import ExamPage from "./features/exam/ExamPage";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/slices/authSlice";

export default function App() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        {/* Navbar with Tailwind styling */}
        <nav className="flex items-center justify-between py-4 border-b mb-6">
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Home
            </Link>
            {token && (
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex space-x-4">
            {token ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded-md transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center py-10">
                <h1 className="text-3xl font-bold mb-4">Exam App</h1>
                <p className="text-gray-600">
                  Use the dashboard to start an exam.
                </p>
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
