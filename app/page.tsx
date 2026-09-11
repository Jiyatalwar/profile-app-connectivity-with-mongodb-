// app/page.tsx
"use client"

import Navbar from "@/app/components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Home</h1>
        <p className="text-gray-600 text-center">
          Use the avatar on the top right to access your account options.
        </p>
      </main>
    </div>
  )
}