-- ============================================================
-- ELCS — Fix admin_users RLS bootstrap issue
-- The original "Admin read admins" policy calls is_admin() which
-- itself queries admin_users — works fine via security definer,
-- but add an explicit "own row" policy as a safety net.
-- ============================================================

-- Allow any authenticated user to read THEIR OWN admin record.
-- This is how the layout confirms "is this logged-in user an admin?"
CREATE POLICY IF NOT EXISTS "User read own admin record"
  ON admin_users FOR SELECT
  USING (id = auth.uid());
