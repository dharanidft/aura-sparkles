"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
): RefObject<T> {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small stagger: add 'visible' to each child that has reveal/reveal-* classes
          const revealEls = el.querySelectorAll<HTMLElement>(
            ".reveal, .reveal-left, .reveal-right, .reveal-scale"
          );
          if (revealEls.length > 0) {
            revealEls.forEach((child) => child.classList.add("visible"));
          } else {
            // The element itself is the reveal target
            el.classList.add("visible");
          }
          if (once) observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}

/** Attach to a container to trigger children with .reveal* classes */
export function useRevealContainer<T extends HTMLElement>(
  threshold = 0.1
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = container.querySelectorAll<HTMLElement>(
            ".reveal, .reveal-left, .reveal-right, .reveal-scale"
          );
          children.forEach((child) => child.classList.add("visible"));
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
