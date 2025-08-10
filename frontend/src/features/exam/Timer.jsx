import { useEffect, useState, useRef } from "react";

export default function Timer({ endsAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState("");
  const hasExpired = useRef(false);

  useEffect(() => {
    if (!endsAt) return;

    // Reset expired state when endsAt changes
    hasExpired.current = false;

    // Parse the end time and add timezone handling
    let endTime;
    try {
      // If the date string doesn't end with 'Z', assume it's UTC and add it
      const dateString = endsAt.endsWith("Z") ? endsAt : endsAt + "Z";
      endTime = new Date(dateString).getTime();

      // Validate the parsed time
      if (isNaN(endTime)) {
        console.error("Invalid end time:", endsAt);
        return;
      }
    } catch (error) {
      console.error("Error parsing end time:", endsAt, error);
      return;
    }

    console.log("Timer setup:");
    console.log("- endsAt:", endsAt);
    console.log("- Parsed end time:", new Date(endTime).toISOString());
    console.log("- Current time:", new Date().toISOString());
    console.log(
      "- Initial difference (minutes):",
      (endTime - Date.now()) / (1000 * 60)
    );

    const updateTimer = () => {
      if (hasExpired.current) return false;

      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        if (!hasExpired.current && onExpire) {
          hasExpired.current = true;
          console.log("Timer expired, calling onExpire");
          // Call onExpire asynchronously to prevent blocking
          setTimeout(() => onExpire(), 0);
        }
        return false;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const seconds = Math.floor((diff / 1000) % 60);

      // Show hours if exam is longer than 60 minutes
      if (hours > 0) {
        setTimeLeft(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }

      return true;
    };

    // Run immediately to set initial state
    if (!updateTimer()) {
      return; // Exit if already expired
    }

    const timer = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      hasExpired.current = false;
    };
  }, [endsAt, onExpire]);

  return (
    <div
      style={{
        fontWeight: "bold",
        color: timeLeft.startsWith("0") && timeLeft < "05:00" ? "red" : "black",
      }}
    >
      Time left: {timeLeft || "Loading..."}
    </div>
  );
}
