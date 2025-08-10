import React, { useState } from "react";
import { useLoginMutation } from "../../services/api";
import { useDispatch } from "react-redux";
import { setToken } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [login] = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      // OAuth2PasswordRequestForm expects form fields; backend implemented login accepts form data.
      const form = new FormData();
      form.append("username", username);
      form.append("password", password);
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:8000"
        }/auth/login`,
        {
          method: "POST",
          body: form,
        }
      );
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      dispatch(setToken(data.access_token));
      nav("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-black py-2 rounded-md transition"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
