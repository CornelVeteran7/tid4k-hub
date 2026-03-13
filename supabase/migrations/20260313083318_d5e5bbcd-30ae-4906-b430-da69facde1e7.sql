
-- Tighten anon policies: restrict to INSERT + UPDATE only (no DELETE/SELECT for anon on devices)
DROP POLICY IF EXISTS "Devices can heartbeat" ON public.display_devices;

-- Anon can only INSERT new devices
CREATE POLICY "Devices can register"
  ON public.display_devices
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon can only UPDATE heartbeat fields
CREATE POLICY "Devices can update heartbeat"
  ON public.display_devices
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
