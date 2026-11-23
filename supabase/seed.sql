-- Imports the articles that used to live in src/content/articles, already published.
-- Run once, after the migration. Safe to re-run: existing web addresses are skipped.

with draft as (
  insert into public.article_drafts (document, published_revision)
  values ($article${"title":"Après-ski extravaganza","slug":"apres-ski-extravaganza","emphasis":"extravaganza","kicker":"Ski season","dek":"Because dressing for the mountains is half the fun","author":"The Curated Capsule","publishedAt":"2026-10-28","cover":"/images/articles/apres-ski-extravaganza/cover.jpg","coverAlt":"A waiter on skis jumps off a snowy chalet roof carrying champagne while a woman in a fur coat and sunglasses sits at the terrace bar below","products":["anorak"],"body":"If Gstaad, St Moritz or Cortina is the destination, I already know what I'm packing.\n\nThere are plenty of reasons to love ski season, but if I'm being completely honest, après-ski might just be my favourite part. What could possibly be better than sitting on a sun-drenched terrace, surrounded by snow-covered mountains, Aperol Spritz in hand, after a day on the slopes? Doing it in a fabulous outfit, obviously.\n\nAnd while I appreciate a good day on the slopes, I'd be lying if I said I didn't give just as much thought to what I'm wearing afterwards. Think statement jackets, cosy cashmere, oversized sunglasses, fur hats, and boots made for more than just the slopes.\n\nConsider this your guide to **après-ski extravaganza**.\n"}$article$::jsonb, 1)
  on conflict (slug) do nothing
  returning id, slug, document
)
insert into public.articles (id, slug, document)
select id, slug, document from draft;
