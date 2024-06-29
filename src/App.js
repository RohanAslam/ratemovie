import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "c314f4dd";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [userRating, setUserRating] = useState(null);

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    setSelectedMovie(null);
  }

  useEffect(
    function () {
      document.title = selectedMovie
        ? `MovieReviews | ${selectedMovie.Title}`
        : "MovieReviews";
    },
    [selectedMovie]
  );

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  const fetchSelectedMovie = async function (id) {
    try {
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${id}`);

      const data = await res.json();

      setSelectedMovie(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSelectMovie = function (id) {
    fetchSelectedMovie(id);
  };

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelect={onSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedMovie ? (
            <SelectedMovie
              selectedMovie={selectedMovie}
              setSelectedMovie={setSelectedMovie}
              onAddWatched={handleAddWatched}
              setUserRating={setUserRating}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} setWatched={setWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function SelectedMovie({
  selectedMovie,
  setSelectedMovie,
  onAddWatched,
  setUserRating,
  watched,
}) {
  const esc = function (e) {
    if (e.code === "Escape") {
      setSelectedMovie("");
    }
  };

  useEffect(function () {
    document.addEventListener("keydown", esc);

    return function () {
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const isWatched = watched
    .map((movie) => movie.imdbID)
    .includes(selectedMovie.imdbID);

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={() => setSelectedMovie("")}>
          ←
        </button>
        <img src={selectedMovie.Poster} alt="Poster of [object Object]" />
        <div className="details-overview">
          <h2>{selectedMovie.Title}</h2>
          <p>{selectedMovie.Released}</p>
          <p>
            <span>⭐️</span>
            {selectedMovie.imdbRating} Average Rating
          </p>
        </div>
      </header>
      <section>
        {!isWatched ? (
          <div className="rating">
            <StarRating onSetRating={setUserRating} defaultRating={0} />
            <button
              className="btn-add"
              onClick={() => onAddWatched(selectedMovie)}
            >
              + Add to List
            </button>
          </div>
        ) : (
          <div className="rating">
            {" "}
            This movie is already in you watched list.
          </div>
        )}

        <p>
          <em>{selectedMovie.Plot}</em>
        </p>
        <button className="btn-add">Details</button>
      </section>
    </div>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>MovieReviews</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "^" : "⌄"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function MovieList({ movies, isLoading, onSelect }) {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie movie={movie} key={movie.imdbID} onSelect={onSelect} />
        ))}
      </ul>
    </>
  );
}

function Movie({ movie, onSelect }) {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, setWatched }) {
  const [isOpen2, setIsOpen2] = useState(true);

  const onMovieRemove = function (id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onRemove={onMovieRemove}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onRemove }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.Runtime}</span>
        </p>
        <button className="btn-delete" onClick={() => onRemove(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}
