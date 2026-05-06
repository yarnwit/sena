-- 1. ลบตารางเก่าออกก่อนเพื่อสร้างใหม่ด้วย UUID (คำเตือน: ข้อมูลในตารางเหล่านี้จะหายไป)
DROP TABLE IF EXISTS public.write_complaint CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.resident CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. สร้างตาราง users ใหม่โดยใช้ user_id เป็น UUID เพื่อให้ตรงกับ Supabase Auth
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY, 
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'resident'
);

-- 3. สร้างตาราง resident ใหม่ให้สัมพันธ์กับ UUID
CREATE TABLE public.resident (
  resident_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  house_no VARCHAR(50),
  phone_number VARCHAR(20),
  resident_type VARCHAR(50)
);

-- 4. สร้างตาราง complaints กลับคืนมา
CREATE TABLE public.complaints (
  complaint_id SERIAL PRIMARY KEY,
  resident_id INT REFERENCES public.resident(resident_id) ON DELETE SET NULL,
  ticket_no VARCHAR(50) UNIQUE,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  phase VARCHAR(50),
  description TEXT NOT NULL,
  reported_date TIMESTAMP DEFAULT now(),
  location_written VARCHAR(255),
  attachment_url VARCHAR(255),
  soi VARCHAR(50),
  intake_channel VARCHAR(50),
  petition VARCHAR(255)
);

-- 5. สร้าง Function สำหรับจัดการ User ใหม่จาก Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- บันทึกลงตาราง public.users
  INSERT INTO public.users (user_id, username, password_hash, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    'handled_by_supabase_auth',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident')
  );

  -- บันทึกลงตาราง public.resident (ถ้าเป็นลูกบ้าน)
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'resident') = 'resident' THEN
    INSERT INTO public.resident (user_id, house_no, phone_number, resident_type)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'house_no',
      NEW.raw_user_meta_data->>'phone_number',
      NEW.raw_user_meta_data->>'resident_type'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ตั้งค่า Trigger ให้ทำงานเมื่อมีการ Insert ใน auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
