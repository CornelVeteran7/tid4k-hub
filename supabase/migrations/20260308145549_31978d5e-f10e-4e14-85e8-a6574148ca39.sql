-- Add sala (room) column to schedule table for M4 Advanced Timetable
ALTER TABLE public.schedule ADD COLUMN IF NOT EXISTS sala text DEFAULT NULL;