# Reusable Authentication Notes

This note documents the authentication system in this project so it can be moved to another Next.js App Router project.

## 1. Required files

Copy these files and keep the same import paths, or update the aliases after copying:

```text
app/signin/page.tsx       Sign-in form
app/signup/page.tsx       Sign-up form
app/actions/auth.ts       Server actions and session handling
models/User.ts            Mongoose user schema
lib/mongodb.ts            MongoDB connection helper
```

Optional files for the logged-in user experience:

```text
app/components/Navbar.tsx User initial, session menu, logout
app/admin/page.tsx        Superuser dashboard
```

The project must support the `@/*` alias used by imports such as `@/app/actions/auth`.

## 2. Required packages

Install these packages in the target project:

```bash
npm install mongoose bcryptjs jose
npm install -D @types/node @types/react
```

The project also needs Next.js, React, TypeScript, and the App Router.

## 3. Environment variables

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=use-a-long-random-secret
SUPERUSER_EMAIL=admin@example.com
```

- `MONGODB_URI` connects Mongoose to MongoDB.
- `JWT_SECRET` signs and verifies the login cookie.
- `SUPERUSER_EMAIL` marks that exact email as `superuser` during signup.
- Never use `NEXT_PUBLIC_` for these values.
- Restart the dev server after changing `.env.local`.

## 4. User model

`models/User.ts` stores:

```ts
name: string
email: string
phone: string
password: string // hashed, excluded from normal queries
role: "user" | "superuser"
```

The password uses `select: false`, so signin must explicitly request it:

```ts
const user = await User.findOne({ email }).select("+password")
```

The password must never be returned to the browser.

## 5. Sign-up flow

1. `app/signup/page.tsx` collects `name`, `email`, `phone`, and `password`.
2. It creates a `FormData` object.
3. It calls the server action `handleSignup(formData)`.
4. The server validates required values.
5. The server normalizes the email to lowercase.
6. The server checks for an existing email.
7. `bcryptjs` hashes the password.
8. `User.create()` stores the new user.
9. The server creates a signed JWT cookie.
10. The page redirects to signin.

Do not accept `role` from the signup form. The server decides whether the account is a normal user or superuser.

## 6. Sign-in flow

1. `app/signin/page.tsx` collects email and password.
2. It calls `handleSignin(formData)`.
3. The server finds the user and loads the hidden password.
4. `bcrypt.compare()` checks the submitted password.
5. The server creates the `auth_token` HTTP-only cookie.
6. `getSession()` reads and verifies that cookie on later requests.

The cookie contains the user id, name, email, and role. It expires after seven days.

## 7. Logout flow

Call the server action:

```ts
await handleLogout()
```

This deletes the `auth_token` cookie. The navbar then clears its local user state.

## 8. Protecting a server action

Use `getSession()` and check the role before changing protected data:

```ts
const session = await getSession()

if (!session || session.role !== "superuser") {
  throw new Error("Superuser access required")
}
```

The check must happen on the server. Hiding a button or link is not security.

## 9. Admin dashboard

The current `/admin` page uses these protected server actions:

```ts
getAdminUsers()       // list users
updateUserRole()      // promote or demote another user
deleteUser()          // delete another user
```

Each action checks for a superuser session. The current superuser cannot demote or delete their own account.

## 10. Routes

```text
/signup   Create an account
/signin   Sign in
/         Home page with avatar and logout menu
/admin    Superuser-only user management page
```

## 11. Important production improvements

Before deploying publicly:

- Use a strong random `JWT_SECRET`.
- Do not commit `.env.local`.
- Add email verification before granting superuser access.
- Replace the email-based first-superuser setup with a one-time server-side bootstrap command.
- Add rate limiting to signup and signin.
- Validate form data with Zod on the server.
- Use generic login errors to avoid exposing whether an email exists.
- Add password reset and account lockout if required.
- Rotate the JWT secret carefully because changing it logs out all users.

## 12. Reuse checklist

- [ ] Copy the five required files.
- [ ] Copy the optional navbar and admin page if needed.
- [ ] Install `mongoose`, `bcryptjs`, and `jose`.
- [ ] Add `MONGODB_URI`, `JWT_SECRET`, and `SUPERUSER_EMAIL`.
- [ ] Confirm the `@/*` TypeScript alias.
- [ ] Start the app and test signup.
- [ ] Test signin and logout.
- [ ] Test `/admin` as a normal user and as a superuser.
- [ ] Keep passwords and environment variables server-side.
