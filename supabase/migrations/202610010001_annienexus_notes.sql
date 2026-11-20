-- ConsultorMacro dqvhztcmusoecbacyfge. Inspection: public tables=0, auth users=0,
-- storage buckets=0. Additive migration; never drops pre-existing objects.
begin;
create table public.annienexus_notes (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(char_length(id) between 1 and 100),
 text text not null check(char_length(btrim(text)) between 1 and 5000),
 topic text not null check(char_length(topic)<=500),
 created_at timestamptz not null default now(),
 primary key(user_id,id)
);
alter table public.annienexus_notes enable row level security;
alter table public.annienexus_notes force row level security;
revoke all on public.annienexus_notes from public, anon, authenticated;
grant select,insert,delete on public.annienexus_notes to authenticated;
create policy notes_read_own on public.annienexus_notes for select to authenticated using ((select auth.uid())=user_id);
create policy notes_insert_own on public.annienexus_notes for insert to authenticated with check ((select auth.uid())=user_id);
create policy notes_delete_own on public.annienexus_notes for delete to authenticated using ((select auth.uid())=user_id);
create function public.annienexus_limit_notes() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
 if (select count(*) from public.annienexus_notes where user_id=new.user_id)>=50 then
  raise exception 'Notebook capacity exceeded';
 end if;
 return new;
end;
$$;
revoke all on function public.annienexus_limit_notes() from public,anon,authenticated;
create trigger limit_notes before insert on public.annienexus_notes for each row execute function public.annienexus_limit_notes();
comment on table public.annienexus_notes is 'Private user notes. Retained until owner deletes them or the Auth account is deleted. No automatic import of browser notes.';
commit;
