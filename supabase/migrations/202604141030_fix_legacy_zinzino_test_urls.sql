begin;

update public.partners
set zinzino_test_url = regexp_replace(
  zinzino_test_url,
  '^https://www\.zinzino\.com/shop/[0-9]+/([A-Za-z]{2})/([A-Za-z]{2}-[A-Za-z]{2})/products/shop/309000/?$',
  'https://www.zinzino.com/shop/site/\1/\2/products/shop/home-health-tests/309000'
)
where zinzino_test_url ~ '^https://www\.zinzino\.com/shop/[0-9]+/[A-Za-z]{2}/[A-Za-z]{2}-[A-Za-z]{2}/products/shop/309000/?$';

commit;
