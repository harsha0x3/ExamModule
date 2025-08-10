import React, { useState } from "react";
import { useRegisterMutation } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [register] = useRegisterMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ email, password, full_name: "" }).unwrap();
      alert("Registered. Now login.");
      nav("/login");
    } catch (err) {
      alert("Register failed");
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Register
        </button>
      </form>
    </div>
  );
}
