-- Photos des idées de livres
alter table public.gift_items add column if not exists image_url text;

update public.gift_items set image_url = '/images/livres/b2ba9197.jpg' where id = 'b2ba9197-2ebe-4bf7-ae83-40f16bed9ea5';
update public.gift_items set image_url = '/images/livres/80273aac.jpg' where id = '80273aac-3983-4b58-bf38-93699c9d99e2';
update public.gift_items set image_url = '/images/livres/dcc55797.jpg' where id = 'dcc55797-01bc-4299-8938-644f2d0f5d58';
update public.gift_items set image_url = '/images/livres/89b6b343.jpg' where id = '89b6b343-14f8-4568-b240-96d125c799a7';
update public.gift_items set image_url = '/images/livres/155e55e8.jpg' where id = '155e55e8-89c2-4bac-8bd7-b3a88f3ce171';
update public.gift_items set image_url = '/images/livres/e28a00ca.jpg' where id = 'e28a00ca-4b2f-4a29-9295-62a31059fc69';
update public.gift_items set image_url = '/images/livres/add8ea71.jpg' where id = 'add8ea71-d414-4b84-ab6f-b6ec6879b60b';
update public.gift_items set image_url = '/images/livres/bd1312ff.jpg' where id = 'bd1312ff-1b15-4ba6-8bd7-c5f00410d228';
update public.gift_items set image_url = '/images/livres/765816c7.jpg' where id = '765816c7-979a-4b6d-bf54-524dd951bfde';
update public.gift_items set image_url = '/images/livres/8bf32eff.jpg' where id = '8bf32eff-a9d7-4555-ac0f-500a0e6642f3';
update public.gift_items set image_url = '/images/livres/e339609e.jpg' where id = 'e339609e-4d87-48a7-9440-a582c77a7539';
