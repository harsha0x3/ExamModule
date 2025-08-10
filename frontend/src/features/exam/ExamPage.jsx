import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  useGetSessionQuery,
  useAutosaveMutation,
  useSubmitMutation,
} from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Timer from "./Timer";

export default function ExamPage() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const { data, isLoading } = useGetSessionQuery(sessionId);
  const [autosave] = useAutosaveMutation();
  const [submit] = useSubmitMutation();

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Prevent multiple submissions and autosaves
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const autosaveInProgress = useRef(false);

  useEffect(() => {
    if (data) {
      // Check if session is already submitted
      if (
        data.session.status === "submitted" ||
        data.session.status === "auto_submitted"
      ) {
        alert(`Exam already completed. Score: ${data.session.score}`);
        nav("/dashboard");
        return;
      }

      const a = {};
      (data.answers || []).forEach((x) => {
        a[x.session_question_id] = x.selected_option_id;
      });
      setAnswers(a);
    }
  }, [data, nav]);

  // Autosave every 30s - but only if session is active
  useEffect(() => {
    if (isSubmitting || hasExpired) return;

    const id = setInterval(() => {
      if (!isSubmitting && !hasExpired) {
        doAutosave();
      }
    }, 30000);
    return () => clearInterval(id);
  }, [answers, isSubmitting, hasExpired]);

  const doAutosave = useCallback(async () => {
    if (!sessionId || autosaveInProgress.current || isSubmitting || hasExpired)
      return;

    autosaveInProgress.current = true;

    const payload = {
      session_id: parseInt(sessionId),
      answers: Object.entries(answers).map(([sqid, opt]) => ({
        session_question_id: parseInt(sqid),
        selected_option_id: opt,
      })),
    };

    try {
      await autosave(payload).unwrap();
      console.log("Autosaved successfully");
    } catch (e) {
      console.error("Autosave error:", e);
      // If autosave fails because session is already submitted, stop trying
      if (e.status === 400) {
        console.log("Session already submitted, stopping autosave");
        setIsSubmitting(true);
      }
    } finally {
      autosaveInProgress.current = false;
    }
  }, [answers, sessionId, autosave, isSubmitting, hasExpired]);

  const onSelect = (sqid, optId) => {
    if (isSubmitting || hasExpired) return;
    setAnswers((prev) => ({ ...prev, [sqid]: optId }));
  };

  const onSubmit = useCallback(async () => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      session_id: parseInt(sessionId),
      answers: Object.entries(answers).map(([sqid, opt]) => ({
        session_question_id: parseInt(sqid),
        selected_option_id: opt,
      })),
    };

    try {
      const res = await submit(payload).unwrap();
      alert("Submitted: score " + res.result.score + "/" + res.result.total);
      nav("/dashboard");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submit failed: " + (err.data?.detail || err.message));
      setIsSubmitting(false);
    }
  }, [sessionId, answers, submit, nav, isSubmitting]);

  const onExpire = useCallback(async () => {
    if (hasExpired || isSubmitting) {
      console.log("Already expired or submitting, ignoring");
      return;
    }

    console.log("Timer expired, auto-submitting");
    setHasExpired(true);

    // Try to autosave first, but don't wait if it fails
    try {
      if (!autosaveInProgress.current) {
        await doAutosave();
      }
    } catch (e) {
      console.log("Final autosave failed, proceeding with submit");
    }

    await onSubmit();
  }, [doAutosave, onSubmit, hasExpired, isSubmitting]);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No session found</div>;

  // If already submitted, don't render the exam
  if (
    data.session.status === "submitted" ||
    data.session.status === "auto_submitted"
  ) {
    return <div>Exam completed. Redirecting...</div>;
  }

  const currentQuestion = data.questions[currentIndex];

  return (
    <div>
      <h3>Exam Session #{data.session.id}</h3>
      <Timer endsAt={data.session.ends_at} onExpire={onExpire} />

      {isSubmitting && (
        <div style={{ color: "orange" }}>Submitting exam...</div>
      )}
      {hasExpired && (
        <div style={{ color: "red" }}>Time expired! Auto-submitting...</div>
      )}

      {/* Show only one question */}
      <div
        style={{
          padding: 10,
          border: "1px solid #eee",
          marginTop: 8,
          opacity: isSubmitting || hasExpired ? 0.5 : 1,
          pointerEvents: isSubmitting || hasExpired ? "none" : "auto",
        }}
        key={currentQuestion.session_question_id}
      >
        <div>
          <strong>
            Q{currentIndex + 1} of {data.questions.length}:
          </strong>{" "}
          {currentQuestion.question.text}
        </div>
        <div style={{ marginTop: 8 }}>
          {currentQuestion.question.options.map((o) => (
            <div key={o.id}>
              <label>
                <input
                  type="radio"
                  name={"sq_" + currentQuestion.session_question_id}
                  checked={
                    answers[currentQuestion.session_question_id] === o.id
                  }
                  onChange={() =>
                    onSelect(currentQuestion.session_question_id, o.id)
                  }
                  disabled={isSubmitting || hasExpired}
                />{" "}
                {o.text}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0 || isSubmitting || hasExpired}
        >
          Previous
        </button>

        {currentIndex < data.questions.length - 1 ? (
          <button
            style={{ marginLeft: 8 }}
            onClick={() =>
              setCurrentIndex((i) => Math.min(i + 1, data.questions.length - 1))
            }
            disabled={isSubmitting || hasExpired}
          >
            Next
          </button>
        ) : (
          <button
            className="primary"
            style={{ marginLeft: 8 }}
            onClick={onSubmit}
            disabled={isSubmitting || hasExpired}
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        )}

        <button
          onClick={doAutosave}
          style={{ marginLeft: 8 }}
          disabled={isSubmitting || hasExpired || autosaveInProgress.current}
        >
          {autosaveInProgress.current ? "Saving..." : "Save now"}
        </button>
      </div>
    </div>
  );
}
