# User Authentication System

An Express API implementing registration, login, password hashing, and JWT-protected routes.

## Run it
```bash
npm install
npm start
```
API runs at `http://localhost:5000`.

Then open `client.html` directly in your browser to try registration, login, and the
protected `/api/profile` route end to end.

## Endpoints
| Method | Route                | Auth required | Description                        |
|--------|----------------------|----------------|-------------------------------------|
| POST   | /api/auth/register   | No             | Create an account (hashes password) |
| POST   | /api/auth/login      | No             | Log in, returns a signed JWT        |
| GET    | /api/profile          | Yes (Bearer)   | Example protected route             |

## How it works
- Passwords are hashed with **bcrypt** before being stored — plaintext passwords are
  never saved.
- On login, a **JWT** is signed containing the user's id and email, valid for 2 hours.
- Protected routes use a `requireAuth` middleware that verifies the `Authorization: Bearer <token>`
  header before allowing the request through.
- Users are stored in `users.json` for simplicity. Swap `readUsers()/writeUsers()` for a
  MongoDB `User` model (via Mongoose) to use a real database — the bcrypt hashing and JWT
  logic stay the same.

## Security notes for production use
- Set `JWT_SECRET` as an environment variable — never hard-code it.
- Serve over HTTPS so tokens aren't exposed in transit.
- Consider shorter token expiry plus a refresh-token flow for longer sessions.
