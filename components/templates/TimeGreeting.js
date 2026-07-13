"use client";

import { useEffect, useState } from "react";

function greetingFor(hour) {
  if (hour < 5) return { text: "Still up? Thanks for stopping by", icon: "🌙" };
  if (hour < 12) return { text: "Good morning", icon: "☀️" };
  if (hour < 17) return { text: "Good afternoon", icon: "🌤️" };
  if (hour < 21) return { text: "Good evening", icon: "🌇" };
  return { text: "Good evening", icon: "🌙" };
}

// A time-of-day greeting based on the visitor's own local clock — genuinely
// tied to when they're looking at the page, not a claim about anything else.
// Renders nothing until mounted so the server (which doesn't know the
// visitor's timezone) and the first client render always agree.
export default function TimeGreeting({ background, textColor }) {
  const [hour, setHour] = useState(null);

  useEffect(() => {
    const initial = setTimeout(() => setHour(new Date().getHours()), 0);
    const id = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  if (hour === null) return null;
  const { text, icon } = greetingFor(hour);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: background, color: textColor }}
    >
      <span aria-hidden>{icon}</span>
      {text}!
    </span>
  );
}
