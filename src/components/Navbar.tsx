"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-40 flex w-full items-center justify-between px-4 py-3 transition-colors duration-300 md:px-12 ${
        scrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold tracking-wider text-red-600 md:text-2xl">
          OURFLIX
        </span>
        <div className="hidden items-center gap-4 text-sm text-gray-300 md:flex">
          {["Home", "Series", "Movies", "Games", "Popular", "My List"].map(
            (item, i) => (
              <button
                key={item}
                className={`transition-colors hover:text-white ${
                  i === 0 ? "font-semibold text-white" : ""
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {/* Right: Icons + Avatar */}
      <div className="flex items-center gap-4">
        {/* Search Icon */}
        <button className="text-white transition-colors hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        {/* Bell Icon */}
        <button className="text-white transition-colors hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        {/* Profile Avatar */}
        {avatarError ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-red-600 to-red-800 text-xs font-bold">
            T
          </div>
        ) : (
          <img
            src="/ourflix-profile.jpg"
            alt="Profile"
            className="h-8 w-8 rounded-sm object-cover"
            onError={() => setAvatarError(true)}
          />
        )}
      </div>
    </nav>
  );
}
