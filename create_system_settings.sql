CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  is_maintenance boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES public.users(user_id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- บันทึกค่าเริ่มต้นให้เป็น false (เปิดใช้งานปกติ)
INSERT INTO public.system_settings (id, is_maintenance) 
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
