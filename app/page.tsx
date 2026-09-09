import Link from "next/link"

const page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Home</h1>

      <div className="flex gap-4">
        <Link
          href="/signin"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Sign In
        </Link>

        <Link
          href="/signup"
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}

export default page