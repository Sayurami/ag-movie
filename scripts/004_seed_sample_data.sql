-- Updated to match the correct database schema with proper TMDB data
-- Insert sample movies with correct schema
INSERT INTO public.movies (tmdb_id, title, overview, poster_path, backdrop_path, release_date, runtime, vote_average, vote_count, genres, trailer_url, embed_url, status) VALUES
(603, 'The Matrix', 'Set in the 22nd century, The Matrix tells the story of a computer programmer who is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.', '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg', '1999-03-30', 136, 8.2, 24821, '["Action", "Science Fiction"]', 'https://www.youtube.com/watch?v=vKQi3bBA1y8', 'https://vidsrc.xyz/embed/movie/603', 'active'),
(27205, 'Inception', 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person''s idea into a target''s subconscious.', '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', '2010-07-15', 148, 8.4, 35021, '["Action", "Science Fiction", "Adventure"]', 'https://www.youtube.com/watch?v=YoHD9XEInc0', 'https://vidsrc.xyz/embed/movie/27205', 'active'),
(155, 'The Dark Knight', 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.', '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', '/qlGoGQSVMzIjGbpvXzZUOH1FjNu.jpg', '2008-07-16', 152, 9.0, 32106, '["Drama", "Action", "Crime", "Thriller"]', 'https://www.youtube.com/watch?v=EXeTwQWrcwY', 'https://vidsrc.xyz/embed/movie/155', 'active'),
(680, 'Pulp Fiction', 'A burger-loving hit man, his philosophical partner, a drug-addled gangster''s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.', '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', '/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg', '1994-09-10', 154, 8.5, 27398, '["Thriller", "Crime"]', 'https://www.youtube.com/watch?v=s7EdQ4FqbhY', 'https://vidsrc.xyz/embed/movie/680', 'active'),
(157336, 'Interstellar', 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/pbrkL804c8yAv3zBZR4QPWZpbQ4.jpg', '2014-11-05', 169, 8.4, 34077, '["Adventure", "Drama", "Science Fiction"]', 'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'https://vidsrc.xyz/embed/movie/157336', 'active');

-- Insert sample TV shows with correct schema
INSERT INTO public.tv_shows (tmdb_id, name, overview, poster_path, backdrop_path, first_air_date, number_of_seasons, number_of_episodes, vote_average, vote_count, genres, trailer_url, status) VALUES
(1396, 'Breaking Bad', 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family''s financial future at any cost as he enters the dangerous world of drugs and crime.', '/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg', '/tsRy63Mu5cu8etL1X20ZLSudYH9.jpg', '2008-01-20', 5, 62, 9.0, 13049, '["Crime", "Drama", "Thriller"]', 'https://www.youtube.com/watch?v=HhesaQXLuRY', 'active'),
(1399, 'Game of Thrones', 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night''s Watch, is all that stands between the realms of men and icy horrors beyond.', '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', '2011-04-17', 8, 73, 8.4, 22548, '["Sci-Fi & Fantasy", "Drama", "Action & Adventure"]', 'https://www.youtube.com/watch?v=rlR4PJn8b8I', 'active'),
(66732, 'Stranger Things', 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.', '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', '2016-07-15', 4, 42, 8.6, 18138, '["Sci-Fi & Fantasy", "Mystery", "Drama"]', 'https://www.youtube.com/watch?v=b9EkMc79ZSU', 'active'),
(2316, 'The Office', 'The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.', '/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg', '/dNHBXlCpVATjqzQB9dCpZJelqmO.jpg', '2005-03-24', 9, 201, 8.6, 5654, '["Comedy"]', 'https://www.youtube.com/watch?v=LHOtME2DL4g', 'active');

-- Insert seasons for Breaking Bad
INSERT INTO public.seasons (tv_show_id, tmdb_id, season_number, name, overview, poster_path, air_date, episode_count)
SELECT 
    tv.id,
    3577,
    1,
    'Season 1',
    'High school chemistry teacher Walter White''s life is suddenly changed when he is diagnosed with terminal lung cancer. He turns to a life of crime, producing and selling methamphetamine with his former student Jesse Pinkman in order to secure his family''s financial future before he dies.',
    '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
    '2008-01-20',
    7
FROM tv_shows tv WHERE tv.tmdb_id = 1396;

INSERT INTO public.seasons (tv_show_id, tmdb_id, season_number, name, overview, poster_path, air_date, episode_count)
SELECT 
    tv.id,
    3578,
    2,
    'Season 2',
    'In the second season, Walt must deal with the chain reaction of his choice, as he and Jesse face new and severe consequences. When danger and suspicion around Walt escalate, he is pushed to new levels of desperation.',
    '/e3oGYpoTUhOFK0BJfloru5ZmfXr.jpg',
    '2009-03-08',
    13
FROM tv_shows tv WHERE tv.tmdb_id = 1396;

-- Insert sample episodes for Breaking Bad Season 1
INSERT INTO public.episodes (season_id, tv_show_id, tmdb_id, episode_number, season_number, name, overview, still_path, air_date, runtime, vote_average, vote_count, embed_url)
SELECT 
    s.id,
    s.tv_show_id,
    62085,
    1,
    1,
    'Pilot',
    'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth in a used RV, to provide for his family once he is gone.',
    '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
    '2008-01-20',
    58,
    7.7,
    117,
    'https://vidsrc.xyz/embed/tv/1396/1/1'
FROM seasons s 
JOIN tv_shows tv ON s.tv_show_id = tv.id 
WHERE tv.tmdb_id = 1396 AND s.season_number = 1;

INSERT INTO public.episodes (season_id, tv_show_id, tmdb_id, episode_number, season_number, name, overview, still_path, air_date, runtime, vote_average, vote_count, embed_url)
SELECT 
    s.id,
    s.tv_show_id,
    62086,
    2,
    1,
    'Cat''s in the Bag...',
    'Walt and Jesse attempt to tie up loose ends. The desperate situation gets more complicated with the flip of a coin. Walt cannot make a decision on what to do next.',
    '/A7ZLqq138QWZmuFEEKBdBSZXN37.jpg',
    '2008-01-27',
    48,
    7.8,
    95,
    'https://vidsrc.xyz/embed/tv/1396/1/2'
FROM seasons s 
JOIN tv_shows tv ON s.tv_show_id = tv.id 
WHERE tv.tmdb_id = 1396 AND s.season_number = 1;
