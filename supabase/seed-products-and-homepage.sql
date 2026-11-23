-- Imports the products, homepage settings and the original cover story.
-- Run once, after 202611230003_products_and_homepage.sql. Safe to re-run.

insert into public.products (id, name, brand, price, photo, photo_alt, url) values
  ('blazer', 'Mirror-finish blazer', 'Aureline', 385, '/images/products/blazer.jpg', 'Model in a grey tailored coat and cropped top photographed from below', 'https://aureline.example/products/mirror-finish-blazer'),
  ('trench', 'Butter leather trench', 'Norr Atelier', 640, '/images/products/trench.jpg', 'Model in a burgundy blazer and black leather gloves seated inside a glass box', 'https://norr-atelier.example/products/butter-leather-trench'),
  ('mesh', 'Layered mesh dress', 'Norr Atelier', 210, '/images/products/mesh.jpg', 'Model in an oversized red set against a clear blue sky', 'https://norr-atelier.example/products/layered-mesh-dress'),
  ('anorak', 'Colour-block anorak', 'Halvard', 295, '/images/products/anorak.jpg', 'Two models in white sunglasses, one in a yellow graphic dress', 'https://halvard.example/products/colour-block-anorak'),
  ('cuff', 'Chrome cuff', 'Studio Fen', 95, '/images/products/cuff.jpg', 'Model in a yellow puffer and sunglasses leaning against a red window frame', 'https://studio-fen.example/products/chrome-cuff'),
  ('slip', 'Bias slip dress', 'Halvard', 128, '/images/products/slip.jpg', 'Model in a silver satin slip dress and black opera gloves', 'https://halvard.example/products/bias-slip-dress'),
  ('slingback', 'Square-toe slingback', 'Aureline', 115, '/images/products/slingback.jpg', 'Three models lying together on crumpled linen', 'https://aureline.example/products/square-toe-slingback'),
  ('suit-jacket', 'Collarless tailored jacket', 'Aureline', 290, '/images/products/suit-jacket.jpg', 'Black collarless tailored jacket', 'https://aureline.example/products/collarless-tailored-jacket'),
  ('pleated-trousers', 'Pleated wide-leg trousers', 'Aureline', 165, '/images/products/pleated-trousers.jpg', 'Black pleated wide-leg trousers', 'https://aureline.example/products/pleated-wide-leg-trousers'),
  ('hobo-bag', 'Leather hobo bag', 'Norr Atelier', 240, '/images/products/hobo-bag.jpg', 'Bronze leather hobo bag with a rolled shoulder strap', 'https://norr-atelier.example/products/leather-hobo-bag'),
  ('pendant', 'Sculpted pendant necklace', 'Studio Fen', 85, '/images/products/pendant.jpg', 'Gold sculptural pendant on a fine black cord', 'https://studio-fen.example/products/sculpted-pendant-necklace'),
  ('kitten-heels', 'Pointed kitten-heel pumps', 'Halvard', 135, '/images/products/kitten-heels.jpg', 'Pair of burgundy leather pointed kitten-heel pumps', 'https://halvard.example/products/pointed-kitten-heel-pumps')
on conflict (id) do nothing;

insert into public.site_settings (id, document) values
  ('homepage', $seed${"coverArticle": "liquid-metal-is-wearing-off-on-everyone", "look": {"photo": "/images/looks/black-suit-look.jpg", "photoAlt": "Flat lay of a black collarless jacket and pleated trousers with a bronze leather hobo bag, a gold pendant necklace and burgundy kitten-heel pumps", "caption": "Look 12 · buy it whole or piece by piece", "pieces": [{"productId": "suit-jacket", "note": "four sizes left"}, {"productId": "pleated-trousers", "note": "runs long"}, {"productId": "hobo-bag", "note": "one size"}, {"productId": "pendant", "note": "adjustable cord"}, {"productId": "kitten-heels", "note": "sizes 36–41"}]}}$seed$::jsonb)
on conflict (id) do nothing;

with draft as (
  insert into public.article_drafts (document, published_revision)
  values ($seed${"title": "Liquid metal is wearing off on everyone", "slug": "liquid-metal-is-wearing-off-on-everyone", "emphasis": "everyone", "kicker": "The cover story", "dek": "Nine houses sent chrome down the runway. One week later, resale prices told us which pieces people actually wanted.", "author": "the Curated Capsule desk", "publishedAt": "2026-09-12", "cover": "/images/articles/liquid-metal-is-wearing-off-on-everyone/cover.jpg", "coverAlt": "Model in an oversized black coat with one hand raised to her head", "products": ["blazer", "trench"], "body": "Chrome arrived all at once. Nine collections, four cities, the same treatment: coated leather, foiled jersey, hardware finished to a mirror. That kind of consensus usually means a fabric mill got there first, and this season it was two of them.\n\nWhat interested us was not the runway but the week after. Resale listings for coated outerwear rose 412% in saves, and the pieces that moved fastest were the plainest ones — a single-breasted blazer, an unlined trench, a cuff. The heavily embellished looks sat.\n\n![Black-and-white portrait of a model with windswept hair](/images/articles/liquid-metal-is-wearing-off-on-everyone/windswept.jpg)\n\n*Backstage, look 12 — the silhouette that resold fastest*\n\n> The pieces people bought were the ones they could wear on a Tuesday.\n\nPrice is doing the sorting. Below about $400 the finish reads as a material choice; above it, as a costume. The blazer sold through three colourways at $385 while the same silhouette in embossed calf, at $1,100, is still in stock everywhere we checked.\n\nIf you buy one thing, buy the outerwear. Coated surfaces hold their value because they cannot be washed and therefore cannot be worn badly — resale condition stays high. Jersey in the same finish degrades in a season.\n\nThe cuff is the cheap entry and the one we would skip. It photographs well and costs about $11 to produce, which is a separate story we are working on.\n"}$seed$::jsonb, 1)
  on conflict (slug) do nothing
  returning id, slug, document
)
insert into public.articles (id, slug, document)
select id, slug, document from draft;
