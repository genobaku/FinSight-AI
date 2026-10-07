# 🛡️ FinSight AI Security & Credential Isolation Policy

## 🔒 Security Principles

1. **Zero Client Secret Leakage**:
   - Private API keys, JWT secrets, database connection strings, and service role keys are **never** included in client-side bundles or repository commits.
   - Client applications only access public configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

2. **File Upload Hardening**:
   - File extension and MIME type validation.
   - Magic byte header verification (`%PDF`, PNG/JPEG signatures).
   - Strict 10 MB size caps.
   - Path traversal prevention via filename sanitization.

3. **Database Security**:
   - PostgreSQL Row Level Security (RLS) policies.
   - Server-side only Supabase Service Role access.

4. **Error Shielding**:
   - Internal stack traces, raw SQL errors, and filesystem paths are shielded from client responses.
