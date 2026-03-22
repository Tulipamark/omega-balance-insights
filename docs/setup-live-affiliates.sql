-- Live affiliate reference setup
-- Current verified live affiliate:
-- - PER8421
-- Blocked for now:
-- - JORGEN (no account / no public.users row yet)
--
-- Important:
-- The live Supabase project currently runs an older partners schema than the
-- additive target migration. Use the minimal update below for the current live DB.
-- Do not try to change referral_code on the existing partner row.

begin;

update public.partners
set
  zinzino_test_url = 'https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000',
  zinzino_shop_url = 'https://www.zinzino.com/2020937624/se',
  zinzino_partner_url = 'https://www.zinzino.com/2020937624/se/sv-se/partnerweb/',
  status = 'verified',
  verified_at = now()
where id = 'ecff90db-915e-4e1b-8a96-1aea271af7ad'
  and user_id = 'ad0c432b-ac91-4050-810b-5b5647916770'
  and referral_code = 'PER8421';

commit;

-- Verify the live affiliate row
select
  p.id,
  p.user_id,
  p.referral_code,
  p.zinzino_test_url,
  p.zinzino_shop_url,
  p.zinzino_partner_url,
  p.status,
  p.verified_at
from public.partners p
where p.referral_code = 'PER8421';

-- Verify recent referral visits after running live tests
select
  id,
  partner_id,
  referral_code,
  session_id,
  landing_page,
  created_at
from public.referral_visits
where referral_code = 'PER8421'
order by created_at desc
limit 50;

-- Verify recent outbound clicks after running live tests
select
  id,
  partner_id,
  referral_code,
  session_id,
  destination_type,
  destination_url,
  created_at
from public.outbound_clicks
where referral_code = 'PER8421'
order by created_at desc
limit 50;
