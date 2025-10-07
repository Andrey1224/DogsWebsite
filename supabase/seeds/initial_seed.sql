-- Seed data for Exotic Bulldog Level demo environment
-- Parents
insert into parents (id, name, slug, breed, sex, birth_date, weight_lbs, color, description, health_clearances, photo_urls)
values
  ('11111111-1111-1111-1111-111111111111', 'Sir Winston', 'sir-winston', 'english_bulldog', 'male', '2021-03-12', 58.5, 'Brindle & White', 'Champion-bloodline English bulldog with OFA-clear respiratory screening.', '{"OFA respiratory","Genetic panel clear"}', '{"https://images.exoticbulldog.dev/parents/sir-winston-1.jpg"}'),
  ('22222222-2222-2222-2222-222222222222', 'Lady Clementine', 'lady-clementine', 'english_bulldog', 'female', '2021-07-04', 48.2, 'Fawn & White', 'Calm temperament, AKC registered, excellent mother.', '{"OFA cardio"}', '{"https://images.exoticbulldog.dev/parents/lady-clementine-1.jpg"}'),
  ('33333333-3333-3333-3333-333333333333', 'Pierre', 'pierre', 'french_bulldog', 'male', '2022-01-25', 27.3, 'Blue Fawn', 'Compact Frenchie with clear DNA panel and great structure.', '{"4-panel DNA"}', '{"https://images.exoticbulldog.dev/parents/pierre-1.jpg"}'),
  ('44444444-4444-4444-4444-444444444444', 'Colette', 'colette', 'french_bulldog', 'female', '2021-11-02', 24.8, 'Lilac & Tan', 'Affectionate dam with excellent socialization and OFA patella clearance.', '{"OFA patella"}', '{"https://images.exoticbulldog.dev/parents/colette-1.jpg"}')
  on conflict (slug) do nothing;

-- Litters
insert into litters (id, name, slug, sire_id, dam_id, mating_date, due_date, born_at, notes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Royal Heritage Litter', 'royal-heritage', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2024-08-12', '2024-10-14', '2024-10-12', 'Healthy trio of English bulldogs with strong bone structure.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Midnight Macarons Litter', 'midnight-macarons', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '2024-09-20', '2024-11-22', '2024-11-19', 'French bulldog litter with vibrant coats and playful personalities.')
  on conflict (slug) do nothing;

-- Puppies (English Bulldogs)
insert into puppies (id, litter_id, name, slug, sex, color, birth_date, price_usd, status, weight_oz, description, photo_urls, video_urls, stripe_payment_link)
values
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Duke', 'duke-english-bulldog', 'male', 'Brindle', '2024-10-12', 4200, 'available', 38, 'Confident male with playful energy and early crate training.', '{"https://images.exoticbulldog.dev/puppies/duke-1.jpg","https://images.exoticbulldog.dev/puppies/duke-2.jpg"}', '{"https://videos.exoticbulldog.dev/duke-walk.mp4"}', 'https://buy.stripe.com/test_4gw4iT4s09kU5R68wy'),
  ('bbbb1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pearl', 'pearl-english-bulldog', 'female', 'Fawn & White', '2024-10-12', 4300, 'reserved', 36, 'Gentle female, loves cuddles, vet health certificate ready.', '{"https://images.exoticbulldog.dev/puppies/pearl-1.jpg","https://images.exoticbulldog.dev/puppies/pearl-2.jpg"}', '{"https://videos.exoticbulldog.dev/pearl-play.mp4"}', 'https://buy.stripe.com/test_eVa3gV4s02dC7hK8wz'),
  ('cccc1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Regal', 'regal-english-bulldog', 'male', 'White & Tan', '2024-10-12', 4100, 'available', 37, 'Calm demeanor, excels with children, AKC paperwork included.', '{"https://images.exoticbulldog.dev/puppies/regal-1.jpg"}', '{"https://videos.exoticbulldog.dev/regal-rest.mp4"}', 'https://buy.stripe.com/test_6oE9AJ5P4cEM8zG6op')
  on conflict (slug) do nothing;

-- Puppies (French Bulldogs)
insert into puppies (id, litter_id, name, slug, sex, color, birth_date, price_usd, status, weight_oz, description, photo_urls, video_urls, stripe_payment_link)
values
  ('dddd1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Marcel', 'marcel-french-bulldog', 'male', 'Blue Fawn', '2024-11-19', 5200, 'available', 22, 'Curious explorer with great structure and clear DNA panel.', '{"https://images.exoticbulldog.dev/puppies/marcel-1.jpg","https://images.exoticbulldog.dev/puppies/marcel-2.jpg"}', '{"https://videos.exoticbulldog.dev/marcel-sniff.mp4"}', 'https://buy.stripe.com/test_fZe5mH9s0fV28zG8wC'),
  ('eeee1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Amélie', 'amelie-french-bulldog', 'female', 'Lilac & Tan', '2024-11-19', 5400, 'available', 21, 'Sweet companion temperament, early socialization complete.', '{"https://images.exoticbulldog.dev/puppies/amelie-1.jpg","https://images.exoticbulldog.dev/puppies/amelie-2.jpg"}', '{"https://videos.exoticbulldog.dev/amelie-cuddle.mp4"}', 'https://buy.stripe.com/test_8wM7uH4s0bhM8zG288'),
  ('ffff1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Éclair', 'eclair-french-bulldog', 'female', 'Merle', '2024-11-19', 5600, 'upcoming', 20, 'Rare merle coat, vet check scheduled at 8 weeks.', '{"https://images.exoticbulldog.dev/puppies/eclair-1.jpg"}', '{"https://videos.exoticbulldog.dev/eclair-wiggle.mp4"}', 'https://buy.stripe.com/test_9AQa7B5P4bZM8zG3cf')
  on conflict (slug) do nothing;

-- Example reservations (optional demo)
insert into reservations (id, puppy_id, customer_name, customer_email, customer_phone, channel, status, deposit_amount, payment_provider, stripe_payment_intent, created_at)
values
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jessica Moore', 'jessica@example.com', '+12055550123', 'site', 'paid', 300, 'stripe', 'pi_demo_123', now())
  on conflict do nothing;

-- Example inquiry
insert into inquiries (id, source, name, email, phone, message, puppy_id, utm)
values
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'form', 'Daniel Carter', 'daniel@example.com', '+12055550145', 'Interested in upcoming French bulldog puppies shipping to GA.', 'ffff1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"utm_source":"instagram","utm_campaign":"holiday"}')
  on conflict do nothing;
