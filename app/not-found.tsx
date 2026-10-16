import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-24 md:py-36 bg-white min-h-[70vh] text-center px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F2E9DF] flex items-center justify-center mx-auto text-[#452638]">
          <Sparkles className="w-8 h-8 text-[#B69A62]" />
        </div>

        <span className="font-serif text-6xl text-[#452638] font-light">404</span>

        <h1 className="font-serif text-3xl text-[#452638] font-normal">
          Page Not Found
        </h1>

        <p className="text-xs text-[#766E65] leading-relaxed">
          The fragrance or collection you are seeking may have been moved, renamed, or is currently out of season.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-full shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
