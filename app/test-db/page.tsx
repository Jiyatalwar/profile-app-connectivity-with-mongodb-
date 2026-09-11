// app/test-db/page.tsx
//  test data collection for connectivty check beetwen  node aand mongodb

"use client"

import { useState } from "react"
import { testMongoConnection } from "@/app/actions/test-db"

export default function TestDbPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setStatus(null)
    const result = await testMongoConnection()
    setStatus(result.message)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full flex flex-col gap-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">MongoDB Connection Test</h1>
        
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>

        {status && (
          <p className={`text-sm p-3 rounded font-medium ${status.includes("Successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
