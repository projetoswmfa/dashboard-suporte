/**
 * Script to apply nested checklist migration to Supabase
 * This script creates the checklist_items table with hierarchical support
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyNestedChecklistMigration() {
  try {
    console.log('🚀 Starting nested checklist migration...');

    // 1. Create checklist_items table
    console.log('📋 Creating checklist_items table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.checklist_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          attendance_id TEXT NOT NULL REFERENCES public.attendances(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          is_completed BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return;
    }
    console.log('✅ Table created successfully');

    // 2. Add parent_id column for nested structure
    console.log('🔗 Adding parent_id column for nested structure...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.checklist_items 
        ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE;
      `
    });

    if (addColumnError) {
      console.error('❌ Error adding parent_id column:', addColumnError);
      return;
    }
    console.log('✅ Parent_id column added successfully');

    // 3. Create indexes for performance
    console.log('📊 Creating indexes for better performance...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_checklist_items_attendance_id ON public.checklist_items(attendance_id);
        CREATE INDEX IF NOT EXISTS idx_checklist_items_parent_id ON public.checklist_items(parent_id);
        CREATE INDEX IF NOT EXISTS idx_checklist_items_is_completed ON public.checklist_items(is_completed);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }
    console.log('✅ Indexes created successfully');

    // 4. Create function to prevent circular references
    console.log('🔄 Creating function to prevent circular references...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION prevent_circular_reference()
        RETURNS TRIGGER AS $$
        DECLARE
            current_parent_id UUID;
            max_depth INTEGER := 10;
            current_depth INTEGER := 0;
        BEGIN
            IF NEW.parent_id IS NULL THEN
                RETURN NEW;
            END IF;
            
            IF NEW.id = NEW.parent_id THEN
                RAISE EXCEPTION 'Cannot set item as its own parent';
            END IF;
            
            current_parent_id := NEW.parent_id;
            
            WHILE current_parent_id IS NOT NULL AND current_depth < max_depth LOOP
                IF current_parent_id = NEW.id THEN
                    RAISE EXCEPTION 'Circular reference detected in checklist hierarchy';
                END IF;
                
                SELECT parent_id INTO current_parent_id 
                FROM public.checklist_items 
                WHERE id = current_parent_id;
                
                current_depth := current_depth + 1;
            END LOOP;
            
            IF current_depth >= max_depth THEN
                RAISE EXCEPTION 'Maximum hierarchy depth exceeded';
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (functionError) {
      console.error('❌ Error creating function:', functionError);
      return;
    }
    console.log('✅ Circular reference prevention function created successfully');

    // 5. Create trigger for circular reference prevention
    console.log('⚡ Creating trigger for circular reference prevention...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS prevent_circular_reference_trigger ON public.checklist_items;
        CREATE TRIGGER prevent_circular_reference_trigger
            BEFORE INSERT OR UPDATE ON public.checklist_items
            FOR EACH ROW
            EXECUTE FUNCTION prevent_circular_reference();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }
    console.log('✅ Circular reference prevention trigger created successfully');

    // 6. Add comments for documentation
    console.log('📝 Adding documentation comments...');
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.checklist_items.parent_id IS 'Reference to parent checklist item for nested structure. NULL for root items.';
      `
    });

    if (commentError) {
      console.error('❌ Error adding comments:', commentError);
      return;
    }
    console.log('✅ Documentation comments added successfully');

    console.log('🎉 Nested checklist migration completed successfully!');
    console.log('📋 You can now create hierarchical checklist items with parent-child relationships.');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Run the migration
if (require.main === module) {
  applyNestedChecklistMigration();
}

module.exports = { applyNestedChecklistMigration };
