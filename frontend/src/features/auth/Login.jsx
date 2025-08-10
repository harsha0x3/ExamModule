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
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className="primary" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
