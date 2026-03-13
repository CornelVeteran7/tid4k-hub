
-- Display devices table: tracks Raspberry Pi units
CREATE TABLE public.display_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  alias text NOT NULL DEFAULT 'Display',
  raspberry_id text,
  last_heartbeat timestamptz,
  screenshot_url text,
  ip_address text,
  os_info text,
  app_version text,
  status text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.display_devices ENABLE ROW LEVEL SECURITY;

-- Inky/admin users can see all devices
CREATE POLICY "Inky users can manage all devices"
  ON public.display_devices
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'inky'))
  WITH CHECK (public.has_role(auth.uid(), 'inky'));

-- Org admins can see their own devices
CREATE POLICY "Org admins can view own devices"
  ON public.display_devices
  FOR SELECT
  TO authenticated
  USING (public.user_org_match(organization_id));

-- Allow anonymous inserts/updates for heartbeat endpoint (Pi devices)
CREATE POLICY "Devices can heartbeat"
  ON public.display_devices
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Device reports table: stores diagnostic data
CREATE TABLE public.device_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.display_devices(id) ON DELETE CASCADE NOT NULL,
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  reported_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inky users can manage reports"
  ON public.device_reports
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'inky'));

CREATE POLICY "Devices can insert reports"
  ON public.device_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Storage bucket for device screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-screenshots', 'device-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anon uploads to device-screenshots bucket
CREATE POLICY "Anon can upload device screenshots"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'device-screenshots');

-- Allow public reads from device-screenshots
CREATE POLICY "Public can read device screenshots"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'device-screenshots');

-- Index for fast heartbeat lookups
CREATE INDEX idx_display_devices_raspberry_id ON public.display_devices(raspberry_id);
CREATE INDEX idx_display_devices_org_id ON public.display_devices(organization_id);
CREATE INDEX idx_device_reports_device_id ON public.device_reports(device_id);
