"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white rounded-xl shadow-md p-8 border border-slate-100">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-2">
          NurseKonnect
        </h1>
        <p className="text-slate-600 mb-6">
          Nurse Konnect
        </p>
        <div className="flex gap-4 justify-center">
          {/* Internal Next.js routing for authentication flows */}
          <Link 
            href="/login" 
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
          {/* External breakout link routing directly to your production cloud admin panel */}
          <a 
            href="https://onrender.com" 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition"
          >
            Backend Admin
          </a>
        </div>
      </div>
    </main>
  );
}
