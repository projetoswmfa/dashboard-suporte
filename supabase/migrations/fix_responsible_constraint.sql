-- Fix responsible constraint to allow multiple responsibles
-- This script removes the existing constraint and optionally adds a more flexible one

-- First, let's check if there's an existing constraint on the responsible column
-- (This is informational - the actual constraint removal is below)

-- Remove any existing check constraint on responsible column
-- Note: Replace 'constraint_name' with the actual constraint name if known
-- You can find constraint names by querying: 
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.attendances'::regclass;

DO $$
BEGIN
    -- Try to drop the constraint if it exists
    -- This will silently fail if the constraint doesn't exist
    BEGIN
        ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_responsible_check;
    EXCEPTION
        WHEN undefined_object THEN
            -- Constraint doesn't exist, continue
            NULL;
    END;
END $$;

-- Optionally, add a new more flexible constraint
-- This allows multiple responsibles separated by comma
-- Uncomment the lines below if you want to add this constraint:

/*
ALTER TABLE public.attendances 
ADD CONSTRAINT attendances_responsible_flexible_check 
CHECK (responsible IS NOT NULL AND length(trim(responsible)) > 0);
*/

-- Verify the constraint was removed
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.attendances'::regclass 
    AND contype = 'c' 
    AND conname LIKE '%responsible%';
