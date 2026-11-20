begin;
insert into auth.users(id,email,aud,role) values ('e5da74fd-6740-40ea-b1f2-5da7e1ef5a5d','annienexus-capacity@example.invalid','authenticated','authenticated');
set local role authenticated;
set local request.jwt.claims='{"sub":"e5da74fd-6740-40ea-b1f2-5da7e1ef5a5d","role":"authenticated"}';
insert into public.annienexus_notes(user_id,id,text,topic) select 'e5da74fd-6740-40ea-b1f2-5da7e1ef5a5d','capacity-'||n,'Fixture','Test' from generate_series(1,49) n;
do $$ begin
 begin
  insert into public.annienexus_notes(user_id,id,text,topic) values
   ('e5da74fd-6740-40ea-b1f2-5da7e1ef5a5d','batch-a','Fixture','Test'),
   ('e5da74fd-6740-40ea-b1f2-5da7e1ef5a5d','batch-b','Fixture','Test');
  raise exception 'Capacity test failed';
 exception when raise_exception then if sqlerrm<>'Notebook capacity exceeded' then raise;end if;end;
 if (select count(*) from public.annienexus_notes)<>49 then raise exception 'Import was not atomic';end if;
end $$;
reset role;
rollback;
select 'PASS: 50-note limit and atomic import; fixtures rolled back' as capacity_test,
 (select count(*) from auth.users) as users_after,(select count(*) from public.annienexus_notes) as notes_after;
