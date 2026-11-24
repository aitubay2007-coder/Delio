-- Example data for the public demo store at /s/primer.
-- Clearly fictional. Safe to run more than once: it does nothing if the slug exists.
-- Apply after the migrations. The SQL editor runs as postgres, which private.protect_store allows.

insert into public.stores (
  id,
  owner_id,
  name,
  slug,
  niche,
  whatsapp_e164,
  logo_path,
  address,
  working_hours,
  delivery_enabled,
  pickup_enabled,
  delivery_zones,
  min_order,
  template,
  accent_color,
  order_form,
  trial_ends_at,
  subscription_status,
  is_demo
)
values (
  '11111111-1111-4111-8111-111111111111',
  null,
  'Цветочная лавка',
  'primer',
  'flowers',
  '+77000000000',
  '/demo/logo.jpg',
  'Алматы, пример адреса',
  '{
    "timezone": "Asia/Almaty",
    "days": {
      "mon": {"closed": false, "open": "10:00", "close": "20:00"},
      "tue": {"closed": false, "open": "10:00", "close": "20:00"},
      "wed": {"closed": false, "open": "10:00", "close": "20:00"},
      "thu": {"closed": false, "open": "10:00", "close": "20:00"},
      "fri": {"closed": false, "open": "10:00", "close": "20:00"},
      "sat": {"closed": false, "open": "11:00", "close": "19:00"},
      "sun": {"closed": true, "open": "11:00", "close": "19:00"}
    }
  }'::jsonb,
  true,
  true,
  '[
    {"id": "center", "name": "В пределах города", "price": 2000},
    {"id": "outside", "name": "За городом", "price": 4000}
  ]'::jsonb,
  0,
  'boutique',
  '#9A4D55',
  '{
    "fields": [
      {"id": "card_text", "key": "card_text", "label": "Текст открытки", "type": "textarea", "required": false},
      {"id": "recipient_name", "key": "recipient_name", "label": "Имя получателя", "type": "text", "required": false},
      {"id": "recipient_phone", "key": "recipient_phone", "label": "Телефон получателя", "type": "phone", "required": false},
      {"id": "surprise", "key": "surprise", "label": "Сюрприз: не говорить, кто отправитель", "type": "checkbox", "required": false}
    ]
  }'::jsonb,
  now() + interval '365 days',
  'active',
  true
)
on conflict (slug) do nothing;

insert into public.categories (id, store_id, name, sort_order)
select * from (
  values
    ('22222222-2222-4222-8222-222222222221'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Сезонные', 0),
    ('22222222-2222-4222-8222-222222222222'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Монобукеты', 1),
    ('22222222-2222-4222-8222-222222222223'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Композиции', 2),
    ('22222222-2222-4222-8222-222222222224'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Открытки', 3)
) as seed(id, store_id, name, sort_order)
where exists (
  select 1 from public.stores s
  where s.id = '11111111-1111-4111-8111-111111111111'
    and s.slug = 'primer'
    and not exists (select 1 from public.categories c where c.store_id = s.id)
);

insert into public.products (id, store_id, category_id, name, description, price, available, sort_order)
select * from (
  values
    (
      '33333333-3333-4333-8333-333333333331'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222221'::uuid,
      'Пионовый сад',
      'Сезонные пионы на длинном стебле. Бумага крафт, лента по желанию.',
      28000, true, 0
    ),
    (
      '33333333-3333-4333-8333-333333333332'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222221'::uuid,
      'Ранункулюсы',
      'Ранункулюсы абрикоса и сливок, собранные неплотно.',
      19000, true, 1
    ),
    (
      '33333333-3333-4333-8333-333333333333'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222222'::uuid,
      'Красные розы',
      'Пятнадцать роз на длинном стебле, без лишней зелени.',
      22000, true, 2
    ),
    (
      '33333333-3333-4333-8333-333333333334'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222223'::uuid,
      'Сухоцветы',
      'Сухоцветы овсяного и песочного тона. Стоят месяцами.',
      14000, true, 3
    ),
    (
      '33333333-3333-4333-8333-333333333335'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222223'::uuid,
      'Коробка с цветами',
      'Низкая композиция в круглой коробке. Крышка в комплекте.',
      32000, true, 4
    ),
    (
      '33333333-3333-4333-8333-333333333336'::uuid,
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222224'::uuid,
      'Открытка',
      'Плотная хлопковая открытка. Фразу напишете в форме заказа.',
      1500, true, 5
    )
) as seed(id, store_id, category_id, name, description, price, available, sort_order)
where exists (
  select 1 from public.stores s
  where s.id = '11111111-1111-4111-8111-111111111111'
    and not exists (select 1 from public.products p where p.store_id = s.id)
);

insert into public.product_photos (id, store_id, product_id, storage_path, sort_order)
select * from (
  values
    ('44444444-4444-4444-8444-444444444441'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333331'::uuid, '/demo/peony.jpg', 0),
    ('44444444-4444-4444-8444-444444444442'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333331'::uuid, '/demo/peony-alt.jpg', 1),
    ('44444444-4444-4444-8444-444444444443'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333332'::uuid, '/demo/ranunculus.jpg', 0),
    ('44444444-4444-4444-8444-444444444444'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, '/demo/roses.jpg', 0),
    ('44444444-4444-4444-8444-444444444445'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333334'::uuid, '/demo/dried.jpg', 0),
    ('44444444-4444-4444-8444-444444444446'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333335'::uuid, '/demo/box.jpg', 0),
    ('44444444-4444-4444-8444-444444444447'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333336'::uuid, '/demo/card.jpg', 0)
) as seed(id, store_id, product_id, storage_path, sort_order)
where exists (
  select 1 from public.products p
  where p.id = '33333333-3333-4333-8333-333333333331'
    and not exists (select 1 from public.product_photos ph where ph.product_id = p.id)
);

insert into public.store_covers (id, store_id, storage_path, sort_order)
select
  '55555555-5555-4555-8555-555555555551',
  '11111111-1111-4111-8111-111111111111',
  '/demo/cover.jpg',
  0
where exists (
  select 1 from public.stores s
  where s.id = '11111111-1111-4111-8111-111111111111'
    and not exists (select 1 from public.store_covers c where c.store_id = s.id)
);
