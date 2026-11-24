-- Public bucket: files are served by URL without a broad SELECT policy,
-- so anonymous clients cannot list every object. Owners can list, replace,
-- and delete only inside their store folder: {store_id}/...
-- Upsert needs INSERT + SELECT + UPDATE.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-media',
  'store-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy store_media_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'store-media'
    and (storage.foldername(name))[1] in (
      select s.id::text
      from public.stores s
      where s.owner_id = (select auth.uid())
    )
  );

create policy store_media_owner_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'store-media'
    and (storage.foldername(name))[1] in (
      select s.id::text
      from public.stores s
      where s.owner_id = (select auth.uid())
    )
  );

create policy store_media_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'store-media'
    and (storage.foldername(name))[1] in (
      select s.id::text
      from public.stores s
      where s.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'store-media'
    and (storage.foldername(name))[1] in (
      select s.id::text
      from public.stores s
      where s.owner_id = (select auth.uid())
    )
  );

create policy store_media_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'store-media'
    and (storage.foldername(name))[1] in (
      select s.id::text
      from public.stores s
      where s.owner_id = (select auth.uid())
    )
  );
