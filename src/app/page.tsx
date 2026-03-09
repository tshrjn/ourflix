"use client";

import { useRouter } from "next/navigation";
import { PROJECT, getPhotoUrl } from "@/data/series";

export default function ProfileSelector() {
  const router = useRouter();

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
            <img
              src={getPhotoUrl(PROJECT.profileAvatar)}
              alt={`${PROJECT.username}'s Profile`}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to a colored div if avatar not loaded
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.style.background =
                  "linear-gradient(135deg, #e50914, #b81d24)";
              }}
            />
          </div>
          <span className="text-sm text-gray-400 transition-colors group-hover:text-white md:text-base">
            {PROJECT.username}
          </span>
        </button>
      </div>
    </div>
  );
}
