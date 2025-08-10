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
    <div>
      <h2>Dashboard</h2>
      <p>Click Start Exam to begin a timed session.</p>
      <button className="primary" onClick={onStart}>
        Start Exam (2 Q, 1 min)
      </button>
    </div>
  );
}
