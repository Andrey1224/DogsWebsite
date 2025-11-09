-- Add breed column to puppies table
-- This allows direct breed selection when creating a puppy
-- Values: 'french_bulldog' or 'english_bulldog'

ALTER TABLE puppies
ADD COLUMN breed text
CHECK (breed = ANY (ARRAY['french_bulldog'::text, 'english_bulldog'::text]));

COMMENT ON COLUMN puppies.breed IS 'Breed of the puppy: french_bulldog or english_bulldog';

-- Create index for filtering puppies by breed
CREATE INDEX idx_puppies_breed ON puppies(breed) WHERE breed IS NOT NULL;
