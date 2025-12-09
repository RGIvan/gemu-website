"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const platforms = [
  { value: "", label: "Todas" },
  { value: "PlayStation", label: "PlayStation" },
  { value: "PlayStation 2", label: "PlayStation 2" },
  { value: "Xbox 360", label: "Xbox 360" },
  { value: "Nintendo Switch", label: "Nintendo Switch" },
];

const FilterPlatform = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentPlatform = searchParams.get("platform") || "";

  const handleFilter = (platform: string) => {
    if (platform) {
      router.push(`/?platform=${platform}`);
    } else {
      router.push("/");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-[#2E2E2E] rounded-md hover:bg-[#1F1F1F] transition-all"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="hidden sm:inline">{currentPlatform || "Filtrar"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md shadow-lg z-50">
          {platforms.map((platform) => (
            <button
              key={platform.value}
              onClick={() => handleFilter(platform.value)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#1F1F1F] transition-all ${
                currentPlatform === platform.value ? "bg-[#1F1F1F]" : ""
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPlatform;
