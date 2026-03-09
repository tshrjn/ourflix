"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT } from "@/data/series";

export default function ProfileSelector() {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414]">
      <div className="animate-fade-in flex flex-col items-center gap-8">
        <h1 className="text-3xl font-medium text-white md:text-4xl">
          Who&apos;s watching?
        </h1>
        <button
          onClick={() => router.push("/browse")}
          className="group flex flex-col items-center gap-3"
        >
          <div className="h-[120px] w-[120px] overflow-hidden rounded-sm border-2 border-transparent transition-all group-hover:border-white md:h-[140px] md:w-[140px]">
            {avatarError ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #e50914, #b81d24)",
                }}
              >
                <svg viewBox="0 0 100 100" className="h-3/4 w-3/4">
                  <circle cx="35" cy="40" r="6" fill="white" />
                  <circle cx="65" cy="40" r="6" fill="white" />
                  <path
                    d="M 30 62 Q 50 80 70 62"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            ) : (
              <img
                src={PROJECT.profileAvatar}
                alt={`${PROJECT.username}'s Profile`}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>
          <span className="text-sm text-gray-400 transition-colors group-hover:text-white md:text-base">
            {PROJECT.username}
          </span>
        </button>
      </div>
    </div>
  );
}
