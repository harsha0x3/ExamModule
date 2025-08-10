import React from "react";
import { useStartExamMutation } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [startExam] = useStartExamMutation();
  const nav = useNavigate();

  async function onStart() {
    try {
      const res = await startExam({
        num_questions: 2,
        duration_minutes: 1,
      }).unwrap();
      nav(`/exam/${res.session_id}`);
    } catch (err) {
      alert("Start failed: " + err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-6 text-gray-700">
          Click Start Exam to begin a timed session.
        </p>
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-black py-2 rounded-md transition"
          onClick={onStart}
        >
          Start Exam (2 Q, 1 min)
        </button>
      </div>
    </div>
  );
}
