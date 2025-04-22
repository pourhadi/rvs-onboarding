-- Supabase database initialization script

-- Create profiles table to store user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  about text,
  street text,
  city text,
  state text,
  zip text,
  birthdate date,
  last_page integer not null default 1
);

-- Create page_components table to configure wizard pages
create table if not exists public.page_components (
  id serial primary key,
  page integer not null,
  component text not null
);

-- Default configuration: ensure each page has at least one component
insert into public.page_components (page, component)
select 2, 'about_me'
where not exists (select 1 from public.page_components where page = 2);
insert into public.page_components (page, component)
select 3, 'address'
where not exists (select 1 from public.page_components where page = 3);