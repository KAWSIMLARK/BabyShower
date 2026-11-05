-- =============================================================================
-- Registre pour bébé : nouvelle catégorie + photos + 58 produits (liste Amazon)
-- =============================================================================
-- Sans danger à exécuter plusieurs fois : aucun produit n'est inséré en double
-- (vérifié par le lien Amazon) et rien d'existant n'est modifié.

alter table public.gift_items add column if not exists image_url text;

alter table public.gift_items drop constraint if exists gift_items_category_check;
alter table public.gift_items
  add constraint gift_items_category_check check (category in ('cadeau', 'livre', 'bebe'));

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Porte-bébé KeaBabies tout-en-1 (gris pierre)', 'Activité et équipement', 39.96, 'https://www.amazon.ca/dp/B091F86N38', '/images/registre-bebe/B091F86N38.jpg', 'bebe', 1
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B091F86N38');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Gants de poussette 7AM Warmmuffs (carreaux brun clair)', 'Vêtements pour bébé', 92.91, 'https://www.amazon.ca/dp/B0DXLMP8D5', '/images/registre-bebe/B0DXLMP8D5.jpg', 'bebe', 2
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DXLMP8D5');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Shampoing et gel douche 2 en 1 ATTITUDE (lot de 2)', 'Bain', 25.90, 'https://www.amazon.ca/dp/B0CQG6QDJQ', '/images/registre-bebe/B0CQG6QDJQ.jpg', 'bebe', 3
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CQG6QDJQ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Débarbouillettes en mousseline Yoofoss (lot de 10)', 'Bain', 22.99, 'https://www.amazon.ca/dp/B0CW5ZRHQS', '/images/registre-bebe/B0CW5ZRHQS.jpg', 'bebe', 4
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CW5ZRHQS');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Gobelet de rinçage Skip Hop Moby (gris)', 'Bain', 14.99, 'https://www.amazon.ca/dp/B07FK63PSH', '/images/registre-bebe/B07FK63PSH.jpg', 'bebe', 5
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B07FK63PSH');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Serviettes de bain à capuche Yoofoss (2 pack)', 'Bain', 29.99, 'https://www.amazon.ca/dp/B0C7KXDY6R', '/images/registre-bebe/B0C7KXDY6R.jpg', 'bebe', 6
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0C7KXDY6R');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Support de bain Angelcare (gris, 0-6 mois)', 'Bain', 27.77, 'https://www.amazon.ca/dp/B01M6YVW7B', '/images/registre-bebe/B01M6YVW7B.jpg', 'bebe', 7
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B01M6YVW7B');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Serviettes à capuche OEKO-TEX coton bio (lot de 2, olive/ivoire)', 'Bain', 26.99, 'https://www.amazon.ca/dp/B0DCF35KT4', '/images/registre-bebe/B0DCF35KT4.jpg', 'bebe', 8
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DCF35KT4');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Lingettes Huggies Natural Care (960 lingettes)', 'Changer les couches', null, 'https://www.amazon.ca/dp/B0HCSZCDVD', '/images/registre-bebe/B0HCSZCDVD.jpg', 'bebe', 9
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0HCSZCDVD');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Bavoirs en mousseline Bearmoss', 'Alimentation', 23.99, 'https://www.amazon.ca/dp/B0C5985ZML', '/images/registre-bebe/B0C5985ZML.jpg', 'bebe', 10
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0C5985ZML');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Bavoirs en mousseline Unnivoll (lot de 12, dégradé de café)', 'Alimentation', 29.99, 'https://www.amazon.ca/dp/B0D1G6CLZ4', '/images/registre-bebe/B0D1G6CLZ4.jpg', 'bebe', 11
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0D1G6CLZ4');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Biberons en verre anti-coliques Thyseed (lot de 2)', 'Alimentation', 79.99, 'https://www.amazon.ca/dp/B0FLQ97Q35', '/images/registre-bebe/B0FLQ97Q35.jpg', 'bebe', 12
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FLQ97Q35');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Tétines orthodontiques Nuk (lot de 5, 0-6 mois)', 'Santé et soins pour bébé', 12.97, 'https://www.amazon.ca/dp/B0914D1RQL', '/images/registre-bebe/B0914D1RQL.jpg', 'bebe', 13
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0914D1RQL');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Tétines BIBS Colour (lot de 2, ivoire/sauge, 0-6 mois)', 'Santé et soins pour bébé', 21.99, 'https://www.amazon.ca/dp/B0BCZLYTSH', '/images/registre-bebe/B0BCZLYTSH.jpg', 'bebe', 14
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0BCZLYTSH');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Tétines rondes BIBS Colour (lot de 2, sauge/ivoire, 0-6 mois)', 'Santé et soins pour bébé', 21.99, 'https://www.amazon.ca/dp/B07YMVHNFL', '/images/registre-bebe/B07YMVHNFL.jpg', 'bebe', 15
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B07YMVHNFL');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Suce Philips Avent Soothie 0-3 mois (paquet de 4)', 'Santé et soins pour bébé', 11.99, 'https://www.amazon.ca/dp/B0D8291NSJ', '/images/registre-bebe/B0D8291NSJ.jpg', 'bebe', 16
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0D8291NSJ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Aspirateur nasal électrique Frida Baby NoseFrida', 'Santé et soins pour bébé', 69.99, 'https://www.amazon.ca/dp/B0G1QB8QH2', '/images/registre-bebe/B0G1QB8QH2.jpg', 'bebe', 17
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0G1QB8QH2');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Gigoteuse d''emmaillotage Love to Dream Swaddle UP', 'Literie et chambre d''enfant', 44.95, 'https://www.amazon.ca/dp/B0FNQP7Z55', '/images/registre-bebe/B0FNQP7Z55.jpg', 'bebe', 18
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FNQP7Z55');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Couverture de réception Whimsy en coton (cerf – taupe)', 'Literie et chambre d''enfant', 39.99, 'https://www.amazon.ca/dp/B0BQ26T7DH', '/images/registre-bebe/B0BQ26T7DH.jpg', 'bebe', 19
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0BQ26T7DH');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Couverture de poussette hibou en polaire (KANGXICHEN)', 'Literie et chambre d''enfant', 28.89, 'https://www.amazon.ca/dp/B099ZNWYBV', '/images/registre-bebe/B099ZNWYBV.jpg', 'bebe', 20
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B099ZNWYBV');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Couverture de réception Whimsy en coton (mouton – kaki)', 'Literie et chambre d''enfant', 39.99, 'https://www.amazon.ca/dp/B0BQ27VGHN', '/images/registre-bebe/B0BQ27VGHN.jpg', 'bebe', 21
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0BQ27VGHN');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Gigoteuse en bambou BubblePanda 1.0 Tog (avoine)', 'Literie et chambre d''enfant', 44.99, 'https://www.amazon.ca/dp/B0DP4QXLCY', '/images/registre-bebe/B0DP4QXLCY.jpg', 'bebe', 22
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DP4QXLCY');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Langes en mousseline lulumoon (lot de 2, carreaux moka)', 'Literie et chambre d''enfant', 29.99, 'https://www.amazon.ca/dp/B0FVMBL1VV', '/images/registre-bebe/B0FVMBL1VV.jpg', 'bebe', 23
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FVMBL1VV');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Langes en mousseline lulumoon (lot de 3, marron)', 'Literie et chambre d''enfant', 52.85, 'https://www.amazon.ca/dp/B0D44VKFGF', '/images/registre-bebe/B0D44VKFGF.jpg', 'bebe', 24
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0D44VKFGF');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Collecteur de lait maternel Momcozy (silicone)', 'Allaitement', 35.28, 'https://www.amazon.ca/dp/B0D9JSQHV1', '/images/registre-bebe/B0D9JSQHV1.jpg', 'bebe', 25
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0D9JSQHV1');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Coussinets d''allaitement Lansinoh (200 pièces)', 'Allaitement', 43.68, 'https://www.amazon.ca/dp/B06XPHR7DF', '/images/registre-bebe/B06XPHR7DF.jpg', 'bebe', 26
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B06XPHR7DF');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Pichet à lait maternel en verre Momcozy', 'Allaitement', 45.99, 'https://www.amazon.ca/dp/B0FP13RDGZ', '/images/registre-bebe/B0FP13RDGZ.jpg', 'bebe', 27
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FP13RDGZ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Plateau de collation universel pour poussette', 'Poussettes et sièges d''auto', 44.99, 'https://www.amazon.ca/dp/B0C1G4985Z', '/images/registre-bebe/B0C1G4985Z.jpg', 'bebe', 28
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0C1G4985Z');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Ventilateur de poussette portable Momcozy 8000 mAh', 'Poussettes et sièges d''auto', 39.99, 'https://www.amazon.ca/dp/B0CXCYJBCP', '/images/registre-bebe/B0CXCYJBCP.jpg', 'bebe', 29
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CXCYJBCP');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Livre doux sensoriel pour bébé (pages tactiles, 0-6 mois)', 'Jouets et livres', 19.99, 'https://www.amazon.ca/dp/B0CFVF8P2Q', '/images/registre-bebe/B0CFVF8P2Q.jpg', 'bebe', 30
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CFVF8P2Q');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Oie câline en peluche Fisher-Price (sons de grelot)', 'Jouets et livres', 14.58, 'https://www.amazon.ca/dp/B0CDMDVMXV', '/images/registre-bebe/B0CDMDVMXV.jpg', 'bebe', 31
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CDMDVMXV');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Livre de dentition doux Peter Rabbit (Beatrix Potter)', 'Jouets et livres', 17.78, 'https://www.amazon.ca/dp/B01N6UA4T4', '/images/registre-bebe/B01N6UA4T4.jpg', 'bebe', 32
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B01N6UA4T4');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Ours en peluche GUND Cable Knit (crème)', 'Jouets et livres', 32.11, 'https://www.amazon.ca/dp/B0B5GHBP81', '/images/registre-bebe/B0B5GHBP81.jpg', 'bebe', 33
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0B5GHBP81');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Jouets sensoriels et de dentition en silicone PandaEar', 'Jouets et livres', 13.95, 'https://www.amazon.ca/dp/B0BW41LXG2', '/images/registre-bebe/B0BW41LXG2.jpg', 'bebe', 34
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0BW41LXG2');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Anneau de dentition Dr. Brown''s Ridgees (girafe)', 'Jouets et livres', 6.92, 'https://www.amazon.ca/dp/B09NP2621K', '/images/registre-bebe/B09NP2621K.jpg', 'bebe', 35
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B09NP2621K');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Livre cartonné noir et blanc « Hello, Baby Animals »', 'Jouets et livres', 11.95, 'https://www.amazon.ca/dp/1938093682', '/images/registre-bebe/1938093682.jpg', 'bebe', 36
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/1938093682');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Mangeoire à fruits et moules de congélation pour bébé (lot de 2)', 'Jouets et livres', 19.99, 'https://www.amazon.ca/dp/B0D9VC65FJ', '/images/registre-bebe/B0D9VC65FJ.jpg', 'bebe', 37
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0D9VC65FJ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Draps-housses en mousseline Bearmoss (lot de 2, avoine)', 'Autres articles', 34.19, 'https://www.amazon.ca/dp/B0CJV2V5Y2', '/images/registre-bebe/B0CJV2V5Y2.jpg', 'bebe', 38
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CJV2V5Y2');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Ensemble d''alimentation en silicone PandaEar (assiettes, tasses, ustensiles)', 'Autres articles', 25.94, 'https://www.amazon.ca/dp/B0B1ZZRJ3L', '/images/registre-bebe/B0B1ZZRJ3L.jpg', 'bebe', 39
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0B1ZZRJ3L');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Bols à ventouse avec cuillères PandaEar (lot de 3)', 'Autres articles', 18.95, 'https://www.amazon.ca/dp/B0DJQKWRW7', '/images/registre-bebe/B0DJQKWRW7.jpg', 'bebe', 40
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DJQKWRW7');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Figurine parlante Woody (Toy Story) Mattel', 'Autres articles', 76.97, 'https://www.amazon.ca/dp/B09CGM4PVM', '/images/registre-bebe/B09CGM4PVM.jpg', 'bebe', 41
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B09CGM4PVM');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Couverture de berceau Bearmoss (mousseline et polaire, 76 x 101 cm)', 'Autres articles', null, 'https://www.amazon.ca/dp/B0CT8BJTKR', '/images/registre-bebe/B0CT8BJTKR.jpg', 'bebe', 42
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CT8BJTKR');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Jouet de voyage à suspendre Itzy Ritzy Bitzy', 'Autres articles', 19.99, 'https://www.amazon.ca/dp/B0DWV2SZRW', '/images/registre-bebe/B0DWV2SZRW.jpg', 'bebe', 43
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DWV2SZRW');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Jouet de siège d''auto noir et blanc (0-6 mois)', 'Autres articles', 19.99, 'https://www.amazon.ca/dp/B0FLL5ZMRK', '/images/registre-bebe/B0FLL5ZMRK.jpg', 'bebe', 44
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FLL5ZMRK');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Kit de brosse à biberon Momcozy Push Press', 'Autres articles', 29.99, 'https://www.amazon.ca/dp/B0FX3QBC6Z', '/images/registre-bebe/B0FX3QBC6Z.jpg', 'bebe', 45
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0FX3QBC6Z');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Couverture de sécurité Lovey en coton bio (ours moka)', 'Autres articles', 19.99, 'https://www.amazon.ca/dp/B0G5M2FKT5', '/images/registre-bebe/B0G5M2FKT5.jpg', 'bebe', 46
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0G5M2FKT5');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Draps de berceau en mousseline lulumoon', 'Autres articles', 24.99, 'https://www.amazon.ca/dp/B0C4YF7YKJ', '/images/registre-bebe/B0C4YF7YKJ.jpg', 'bebe', 47
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0C4YF7YKJ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Livres en tissu sensoriels beiens', 'Autres articles', 19.99, 'https://www.amazon.ca/dp/B07TXYC6WD', '/images/registre-bebe/B07TXYC6WD.jpg', 'bebe', 48
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B07TXYC6WD');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Housse de protection pour siège d''auto (extra épaisse)', 'Autres articles', 35.69, 'https://www.amazon.ca/dp/B0B1J1TYM7', '/images/registre-bebe/B0B1J1TYM7.jpg', 'bebe', 49
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0B1J1TYM7');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Protections de siège d''auto rembourrées (lot de 2)', 'Autres articles', 33.97, 'https://www.amazon.ca/dp/B07R454CJG', '/images/registre-bebe/B07R454CJG.jpg', 'bebe', 50
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B07R454CJG');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Lime à ongles électrique pour bébé Momcozy (avec veilleuse)', 'Autres articles', 29.97, 'https://www.amazon.ca/dp/B0CL4G33BX', '/images/registre-bebe/B0CL4G33BX.jpg', 'bebe', 51
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CL4G33BX');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Ensemble de brosses à biberon 7 en 1 Momcozy (avec égouttoir)', 'Autres articles', 24.99, 'https://www.amazon.ca/dp/B0DFPVB4CZ', '/images/registre-bebe/B0DFPVB4CZ.jpg', 'bebe', 52
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DFPVB4CZ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Coffret cadeau de couvertures en coton bio pour nouveau-né', 'Autres articles', 49.99, 'https://www.amazon.ca/dp/B0F38PBG4L', '/images/registre-bebe/B0F38PBG4L.jpg', 'bebe', 53
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0F38PBG4L');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Veilleuse MediAcous 7 couleurs', 'Autres articles', 29.99, 'https://www.amazon.ca/dp/B09JGHK4QJ', '/images/registre-bebe/B09JGHK4QJ.jpg', 'bebe', 54
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B09JGHK4QJ');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Machine à son portable Hatch Go (mastic)', 'Autres articles', 56.99, 'https://www.amazon.ca/dp/B0DVBFRJH1', '/images/registre-bebe/B0DVBFRJH1.jpg', 'bebe', 55
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0DVBFRJH1');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Jouets en tissu noir et blanc avec miroir (0-6 mois)', 'Autres articles', 17.99, 'https://www.amazon.ca/dp/B0C3VBL4N4', '/images/registre-bebe/B0C3VBL4N4.jpg', 'bebe', 56
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0C3VBL4N4');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Pare-soleil autocollants Jolly Jumper (lot de 2)', 'Autres articles', 11.44, 'https://www.amazon.ca/dp/B09NF36TX6', '/images/registre-bebe/B09NF36TX6.jpg', 'bebe', 57
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B09NF36TX6');

insert into public.gift_items (name, description, price, link_url, image_url, category, sort_order)
select 'Thermomètre auriculaire infrarouge Femometer', 'Autres articles', 39.99, 'https://www.amazon.ca/dp/B0CJXN675J', '/images/registre-bebe/B0CJXN675J.jpg', 'bebe', 58
where not exists (select 1 from public.gift_items where category = 'bebe' and link_url = 'https://www.amazon.ca/dp/B0CJXN675J');

