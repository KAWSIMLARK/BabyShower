-- Photos du registre de cadeaux spéciaux
alter table public.gift_items add column if not exists image_url text;

update public.gift_items set image_url = '/images/registre-special/ee2d0b5e.jpg' where id = 'ee2d0b5e-178b-4379-8aa6-a7467e2784ba';
update public.gift_items set image_url = '/images/registre-special/5071d683.jpg' where id = '5071d683-e9b4-4d03-b79a-792778680138';
update public.gift_items set image_url = '/images/registre-special/3b4ddbdc.jpg' where id = '3b4ddbdc-2bb3-4108-b485-d69d82c3c80e';
update public.gift_items set image_url = '/images/registre-special/d3172986.jpg' where id = 'd3172986-87e4-4631-9eb6-8015dfca7eaf';
update public.gift_items set image_url = '/images/registre-special/72544e64.jpg' where id = '72544e64-14c0-4da5-a366-f5b92d259dab';
update public.gift_items set image_url = '/images/registre-special/126d06d2.jpg' where id = '126d06d2-dec7-40ff-b227-b05510aecbb1';
update public.gift_items set image_url = '/images/registre-special/85f2dd3d.jpg' where id = '85f2dd3d-0ad8-4cda-b03e-36751d5bf1bb';
update public.gift_items set image_url = '/images/registre-special/2281bea8.jpg' where id = '2281bea8-09cb-410f-b86b-b97f86f1375a';
update public.gift_items set image_url = '/images/registre-special/7a39dd7e.jpg' where id = '7a39dd7e-33f4-4d04-b48a-28ffed1b591d';
update public.gift_items set image_url = '/images/registre-special/96dc6ed9.jpg' where id = '96dc6ed9-c682-4f75-94e8-6c7d36da8f14';
update public.gift_items set image_url = '/images/registre-special/ac066800.jpg' where id = 'ac066800-a5c8-4361-866d-3d77e757d3ec';
update public.gift_items set image_url = '/images/registre-special/70ceda47.jpg' where id = '70ceda47-409f-43c0-a689-58dd526ecbe4';
update public.gift_items set image_url = '/images/registre-special/7ecb560d.jpg' where id = '7ecb560d-d461-4b21-8093-d0307af0a3c5';
update public.gift_items set image_url = '/images/registre-special/1cad1942.jpg' where id = '1cad1942-ec44-4b37-a872-18e93071d9ff';
