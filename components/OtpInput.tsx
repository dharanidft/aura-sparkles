"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      // Clear this slot
      const nextArr = [...digits];
      nextArr[index] = "";
      onChange(nextArr.join(""));
      return;
    }

    if (rawVal.length > 1) {
      // Multiple digits entered or pasted into a single box
      handlePasteString(rawVal);
      return;
    }

    const nextArr = [...digits];
    nextArr[index] = rawVal[0];
    const newCode = nextArr.join("");
    onChange(newCode);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  const handlePasteString = (pasted: string) => {
    const clean = pasted.replace(/\D/g, "").slice(0, length);
    if (!clean) return;
    onChange(clean);
    const targetIdx = Math.min(clean.length, length - 1);
    inputRefs.current[targetIdx]?.focus();
    if (clean.length === length && onComplete) {
      onComplete(clean);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePasteString(pasted);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[idx]}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-200 focus:outline-none select-all ${
            digits[idx]
              ? "border-[#1C1917] bg-white text-[#1C1917] shadow-sm"
              : "border-[#D6D3D1] bg-[#FAFAF9] text-[#1C1917] hover:border-[#A16207]/50"
          } focus:border-[#A16207] focus:ring-2 focus:ring-[#A16207]/20 focus:bg-white`}
          aria-label={`Digit ${idx + 1} of ${length}`}
        />
      ))}
    </div>
  );
}
