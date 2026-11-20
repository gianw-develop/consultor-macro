-- Entire test rolls back. Fixtures have no password or external identity.
begin;
insert into auth.users(id,email,aud,role) values
 ('5790b08a-181b-4f37-b678-420661485b57','annienexus-test-a@example.invalid','authenticated','authenticated'),
 ('0a2d3a5c-da85-4a1e-a53f-45a1a1b92514','annienexus-test-b@example.invalid','authenticated','authenticated');
set local role authenticated;
set local request.jwt.claims='{"sub":"5790b08a-181b-4f37-b678-420661485b57","role":"authenticated"}';
insert into public.annienexus_notes(user_id,id,text,topic) values ('5790b08a-181b-4f37-b678-420661485b57','fixture-a','Fixture A','Test');
do $$ begin if (select count(*) from public.annienexus_notes)<>1 then raise exception 'Own read failed';end if;end $$;
set local request.jwt.claims='{"sub":"0a2d3a5c-da85-4a1e-a53f-45a1a1b92514","role":"authenticated"}';
do $$ begin
 if exists(select 1 from public.annienexus_notes) then raise exception 'Cross-user read leaked';end if;
 begin
  insert into public.annienexus_notes(user_id,id,text,topic) values('5790b08a-181b-4f37-b678-420661485b57','forged','Forbidden','Test');
  raise exception 'Cross-user insert allowed';
 exception when insufficient_privilege then null;end;
end $$;
insert into public.annienexus_notes(user_id,id,text,topic) values ('0a2d3a5c-da85-4a1e-a53f-45a1a1b92514','fixture-b','Fixture B','Test');
do $$ begin if (select count(*) from public.annienexus_notes)<>1 then raise exception 'User B isolation failed';end if;end $$;
reset role;
do $$ begin if (select count(*) from public.annienexus_notes where id in ('fixture-a','fixture-b'))<>2 then raise exception 'Fixture count failed';end if;end $$;
do $$ begin if has_table_privilege('authenticated','public.annienexus_notes','UPDATE') then raise exception 'Unexpected update permission'; end if; end $$;
set local role anon;
do $$ begin
 begin perform 1 from public.annienexus_notes;raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'PASS: own read/write, cross-user read/insert blocked, no update grant, anonymous read blocked; fixtures rolled back' as isolation_test,
 (select count(*) from auth.users) as users_after,
 (select count(*) from public.annienexus_notes) as notes_after;
