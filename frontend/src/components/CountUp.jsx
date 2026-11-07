
import { useEffect, useState } from "react";

function CountUp({ value = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Number(value) || 0);
    const duration = 3000;
    let frameId;
    let startTime;

    const animate = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(target * easedProgress)
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [value]);

  return <>{displayValue}</>;
}

export default CountUp;
