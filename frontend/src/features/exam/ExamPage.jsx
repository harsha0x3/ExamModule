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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const autosaveInProgress = useRef(false);

  useEffect(() => {
    if (data) {
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
    if (isSubmitting) return;
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
    if (hasExpired || isSubmitting) return;
    console.log("Timer expired, auto-submitting");
    setHasExpired(true);
    try {
      if (!autosaveInProgress.current) {
        await doAutosave();
      }
    } catch {
      console.log("Final autosave failed, proceeding with submit");
    }
    await onSubmit();
  }, [doAutosave, onSubmit, hasExpired, isSubmitting]);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!data) return <div>No session found</div>;

  if (
    data.session.status === "submitted" ||
    data.session.status === "auto_submitted"
  ) {
    return <div>Exam completed. Redirecting...</div>;
  }

  const currentQuestion = data.questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h3 className="text-2xl font-semibold mb-4">
        Exam Session #{data.session.id}
      </h3>
      <Timer endsAt={data.session.ends_at} onExpire={onExpire} />

      {isSubmitting && (
        <div className="text-orange-500 mt-2">Submitting exam...</div>
      )}
      {hasExpired && (
        <div className="text-red-500 mt-2">
          Time expired! Auto-submitting...
        </div>
      )}

      <div
        className={`p-4 border rounded-md mt-6 transition-opacity ${
          isSubmitting || hasExpired ? "opacity-50 pointer-events-none" : ""
        }`}
        key={currentQuestion.session_question_id}
      >
        <div className="font-medium mb-4">
          <span>
            Q{currentIndex + 1} of {data.questions.length}:
          </span>{" "}
          {currentQuestion.question.text}
        </div>
        <div className="space-y-2">
          {currentQuestion.question.options.map((o) => (
            <label
              key={o.id}
              className="flex space-x-3 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                name={"sq_" + currentQuestion.session_question_id}
                checked={answers[currentQuestion.session_question_id] === o.id}
                onChange={() =>
                  onSelect(currentQuestion.session_question_id, o.id)
                }
                disabled={isSubmitting || hasExpired}
              />
              <span className="text-gray-700">{o.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0 || isSubmitting || hasExpired}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex < data.questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentIndex((i) => Math.min(i + 1, data.questions.length - 1))
            }
            disabled={isSubmitting || hasExpired}
            className="px-4 py-2 rounded bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting || hasExpired}
            className="px-4 py-2 rounded bg-green-500 text-black hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        )}

        <button
          onClick={doAutosave}
          disabled={isSubmitting || hasExpired || autosaveInProgress.current}
          className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50"
        >
          {autosaveInProgress.current ? "Saving..." : "Save now"}
        </button>
      </div>
    </div>
  );
}
