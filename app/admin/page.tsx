"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  deleteUser,
  getAdminUsers,
  updateUserRole,
} from "@/app/actions/auth"

type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  role: "user" | "superuser"
  createdAt: string
  isCurrentUser: boolean
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    try {
      setUsers(await getAdminUsers())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Access denied")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  async function changeRole(user: AdminUser, role: "user" | "superuser") {
    setLoading(true)
    const result = await updateUserRole(user.id, role)
    setMessage(result.message)
    if (result.success) {
      await loadUsers()
    } else {
      setLoading(false)
    }
  }

  async function removeUser(user: AdminUser) {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return

    setLoading(true)
    const result = await deleteUser(user.id)
    setMessage(result.message)
    if (result.success) {
      await loadUsers()
    } else {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Superuser area</p>
            <h1 className="text-3xl font-bold text-gray-900">Admin dashboard</h1>
            <p className="mt-1 text-gray-600">Manage accounts and permissions.</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back home
          </Link>
        </div>

        {message && (
          <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            {message}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-gray-600">No users found.</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.phone}</td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        disabled={user.isCurrentUser}
                        onChange={(event) =>
                          void changeRole(
                            user,
                            event.target.value as "user" | "superuser",
                          )
                        }
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
                        aria-label={`Role for ${user.name}`}
                      >
                        <option value="user">User</option>
                        <option value="superuser">Superuser</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={user.isCurrentUser}
                        onClick={() => void removeUser(user)}
                        className="font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
