-- Refuerzo de seguridad · 20/11/2026
-- 1) Ninguna cuenta nueva puede crearse si su correo no está en la lista, aunque
--    alguien llame a Supabase directamente con la clave pública.
-- 2) Los apuntes solo se leen/escriben si el correo de la sesión está en la lista.
-- Antes de ejecutar: sustituye TU_CORREO por tu correo autorizado (no lo subas al repo).
begin;
create table if not exists public.annienexus_allowed_emails (email text primary key check (email = lower(email)));
alter table public.annienexus_allowed_emails enable row level security;
alter table public.annienexus_allowed_emails force row level security;
revoke all on public.annienexus_allowed_emails from public, anon, authenticated;
insert into public.annienexus_allowed_emails(email) values (lower('TU_CORREO')) on conflict do nothing;

create or replace function public.annienexus_email_allowed(candidate text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.annienexus_allowed_emails where email = lower(coalesce(candidate, '')));
$$;
revoke all on function public.annienexus_email_allowed(text) from public, anon;
grant execute on function public.annienexus_email_allowed(text) to authenticated;

create or replace function public.annienexus_block_unlisted_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not public.annienexus_email_allowed(new.email) then
    raise exception 'Registro no permitido';
  end if;
  return new;
end;
$$;
revoke all on function public.annienexus_block_unlisted_signup() from public, anon, authenticated;
drop trigger if exists annienexus_block_unlisted_signup on auth.users;
create trigger annienexus_block_unlisted_signup before insert on auth.users
  for each row execute function public.annienexus_block_unlisted_signup();

drop policy if exists notes_read_own on public.annienexus_notes;
drop policy if exists notes_insert_own on public.annienexus_notes;
drop policy if exists notes_delete_own on public.annienexus_notes;
create policy notes_read_own on public.annienexus_notes for select to authenticated
  using ((select auth.uid()) = user_id and public.annienexus_email_allowed((select auth.jwt() ->> 'email')));
create policy notes_insert_own on public.annienexus_notes for insert to authenticated
  with check ((select auth.uid()) = user_id and public.annienexus_email_allowed((select auth.jwt() ->> 'email')));
create policy notes_delete_own on public.annienexus_notes for delete to authenticated
  using ((select auth.uid()) = user_id and public.annienexus_email_allowed((select auth.jwt() ->> 'email')));
commit;
