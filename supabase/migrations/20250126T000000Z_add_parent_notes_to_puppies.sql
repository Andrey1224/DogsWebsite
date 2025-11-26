-- Add 8 parent notes columns to puppies table
-- Purpose: Store editable parent information per puppy listing

ALTER TABLE puppies
  ADD COLUMN sire_weight_notes TEXT DEFAULT 'Contact for details',
  ADD COLUMN sire_color_notes TEXT DEFAULT 'Contact for details',
  ADD COLUMN sire_health_notes TEXT DEFAULT 'Health tested',
  ADD COLUMN sire_temperament_notes TEXT DEFAULT 'Temperament notes coming soon.',
  ADD COLUMN dam_weight_notes TEXT DEFAULT 'Contact for details',
  ADD COLUMN dam_color_notes TEXT DEFAULT 'Contact for details',
  ADD COLUMN dam_health_notes TEXT DEFAULT 'Health tested',
  ADD COLUMN dam_temperament_notes TEXT DEFAULT 'Temperament notes coming soon.';

-- Add comments for documentation
COMMENT ON COLUMN puppies.sire_weight_notes IS 'Display text for sire weight (e.g., "28 lbs, compact build")';
COMMENT ON COLUMN puppies.sire_color_notes IS 'Display text for sire color (e.g., "Blue fawn with black mask")';
COMMENT ON COLUMN puppies.sire_health_notes IS 'Display text for sire health (e.g., "OFA hips, heart tested")';
COMMENT ON COLUMN puppies.sire_temperament_notes IS 'Quote or description of sire temperament (500 chars)';
COMMENT ON COLUMN puppies.dam_weight_notes IS 'Display text for dam weight';
COMMENT ON COLUMN puppies.dam_color_notes IS 'Display text for dam color';
COMMENT ON COLUMN puppies.dam_health_notes IS 'Display text for dam health';
COMMENT ON COLUMN puppies.dam_temperament_notes IS 'Quote or description of dam temperament (500 chars)';
