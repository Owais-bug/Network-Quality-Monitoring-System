
import { useState, useEffect } from "react";

function TypingHeading({ text, speed = 90}) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    // Respect reduced-motion accessibility settings
    if (window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches) {
      setVisibleText(text);
      return;
    }

    let index = 0;
    setVisibleText("");

    const timer = setInterval(() => {
      index++;

      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <h1 className="typing-heading" aria-label={text}>
      <span aria-hidden="true">{visibleText}</span>
      <span
        className="typing-cursor"
        aria-hidden="true"
      >
        |
      </span>
    </h1>
  );
}

export default TypingHeading;
