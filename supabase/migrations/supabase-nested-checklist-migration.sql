-- Migration: Add nested checklist support to attendances system
-- This migration adds a new table for checklist items with hierarchical support

-- Create checklist_items table with nested support
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id TEXT NOT NULL REFERENCES public.attendances(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_checklist_items_attendance_id ON public.checklist_items(attendance_id);
CREATE INDEX idx_checklist_items_parent_id ON public.checklist_items(parent_id);
CREATE INDEX idx_checklist_items_is_completed ON public.checklist_items(is_completed);

-- Function to prevent circular references in the hierarchy
CREATE OR REPLACE FUNCTION prevent_circular_reference()
RETURNS TRIGGER AS $$
DECLARE
    current_parent_id UUID;
    max_depth INTEGER := 10; -- Maximum allowed depth to prevent infinite loops
    current_depth INTEGER := 0;
BEGIN
    -- Only check if parent_id is being set
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check if trying to set parent to itself
    IF NEW.id = NEW.parent_id THEN
        RAISE EXCEPTION 'Cannot set item as its own parent';
    END IF;
    
    -- Traverse up the hierarchy to check for circular references
    current_parent_id := NEW.parent_id;
    
    WHILE current_parent_id IS NOT NULL AND current_depth < max_depth LOOP
        -- If we find the current item's ID in the parent chain, it's a circular reference
        IF current_parent_id = NEW.id THEN
            RAISE EXCEPTION 'Circular reference detected in checklist hierarchy';
        END IF;
        
        -- Get the parent of the current parent
        SELECT parent_id INTO current_parent_id 
        FROM public.checklist_items 
        WHERE id = current_parent_id;
        
        current_depth := current_depth + 1;
    END LOOP;
    
    -- If we reached max depth, something might be wrong
    IF current_depth >= max_depth THEN
        RAISE EXCEPTION 'Maximum hierarchy depth exceeded';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular references
CREATE TRIGGER prevent_circular_reference_trigger
    BEFORE INSERT OR UPDATE ON public.checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_reference();

-- Enable Row Level Security
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an internal IT dashboard)
CREATE POLICY "Allow all operations on checklist_items" ON public.checklist_items
FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_checklist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_checklist_items_updated_at 
    BEFORE UPDATE ON public.checklist_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_checklist_items_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.checklist_items IS 'Checklist items for attendances with hierarchical support';
COMMENT ON COLUMN public.checklist_items.parent_id IS 'Reference to parent checklist item for nested structure. NULL for root items.';
COMMENT ON COLUMN public.checklist_items.attendance_id IS 'Reference to the attendance this checklist item belongs to';
COMMENT ON COLUMN public.checklist_items.title IS 'Title/name of the checklist item';
COMMENT ON COLUMN public.checklist_items.description IS 'Optional detailed description of the checklist item';
COMMENT ON COLUMN public.checklist_items.is_completed IS 'Whether this checklist item has been completed';
