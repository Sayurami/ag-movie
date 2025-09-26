-- Insert some sample movies for testing
INSERT INTO movies (
  tmdb_id, title, overview, poster_path, backdrop_path, release_date, runtime, 
  vote_average, vote_count, genres, embed_url, status
) VALUES 
(
  550, 
  'Fight Club', 
  'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
  '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
  '1999-10-15',
  139,
  8.4,
  26280,
  '[{"id": 18, "name": "Drama"}]',
  'https://hglink.to/e/sample1',
  'active'
),
(
  13, 
  'Forrest Gump', 
  'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
  '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
  '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
  '1994-06-23',
  142,
  8.5,
  25853,
  '[{"id": 18, "name": "Drama"}, {"id": 35, "name": "Comedy"}]',
  'https://hglink.to/e/sample2',
  'active'
),
(
  238, 
  'The Godfather', 
  'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
  '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
  '1972-03-14',
  175,
  9.2,
  18967,
  '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]',
  'https://hglink.to/e/sample3',
  'active'
);

-- Insert some sample TV shows
INSERT INTO tv_shows (
  tmdb_id, name, overview, poster_path, backdrop_path, first_air_date, 
  number_of_seasons, number_of_episodes, vote_average, vote_count, genres, status
) VALUES 
(
  1399,
  'Game of Thrones',
  'Seven noble families fight for control of the mythical land of Westeros.',
  '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
  '2011-04-17',
  8,
  73,
  9.2,
  21973,
  '[{"id": 10765, "name": "Sci-Fi & Fantasy"}, {"id": 18, "name": "Drama"}]',
  'active'
),
(
  1396,
  'Breaking Bad',
  'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
  '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
  '2008-01-20',
  5,
  62,
  9.4,
  12279,
  '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]',
  'active'
);
