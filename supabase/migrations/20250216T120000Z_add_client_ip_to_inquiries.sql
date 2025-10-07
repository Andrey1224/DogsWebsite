alter table inquiries
  add column if not exists client_ip inet;

create index if not exists idx_inquiries_client_ip_created_at
  on inquiries (client_ip, created_at);
