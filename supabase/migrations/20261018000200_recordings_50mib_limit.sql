-- Supabase Free allows at most 50 MiB per uploaded object.
-- Keep this as a forward migration; the previously applied 02A migration is immutable.
do $$
begin
  update storage.buckets
  set file_size_limit = 52428800
  where id = 'recordings';

  if not found then
    raise exception 'Expected the existing recordings Storage bucket before applying the 50 MiB limit';
  end if;
end;
$$;
