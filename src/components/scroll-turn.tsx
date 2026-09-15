"use client";

import { useEffect, useRef, type ComponentProps } from "react";

type ScrollTurnProps = ComponentProps<"div"> & {
  degrees?: number;
};

export function ScrollTurn({ degrees = 200, ...props }: ScrollTurnProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;

    const render = () => {
      frame = 0;
      const { top, height } = node.getBoundingClientRect();
      const progress = 1 - (top + height / 2) / window.innerHeight;
      node.style.setProperty("--turn", `${(progress * degrees).toFixed(1)}deg`);
    };

    const schedule = () => {
      frame ||= requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [degrees]);

  return <div ref={ref} {...props} />;
}
