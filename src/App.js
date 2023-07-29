import { useEffect, useState } from "react";
import StarRating from "./Star";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    title: "Inception",
    Year: "2010",
    poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    title: "Back to the Future",
    Year: "1985",
    poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "e9027f6a";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setEroor] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  function handleSelecteID(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }
  function handleCloseID() {
    setSelectedID(null);
  }
  function handleAddWatchedMovie(movie) {
    setWatched((movies) => [...movies, movie]);
  }
  function handleDeleteWatched(id) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovie() {
        try {
          setIsLoading(true);
          setEroor("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movies Not Found");
          setMovies(data.Search);
          setEroor("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setEroor(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setEroor("");
        return;
      }
      fetchMovie();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  // Component Composition
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {/* 
        passing prop explicitly . childer prop passed implicitly
        <Box element={<ListMovies movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          }
        /> */}
        <Box>
          {/* {isLoading ? <Loader /> : <ListMovies movies={movies} />} */}

          {isLoading && <Loader />}
          {error && <ErrorMsg message={error} />}
          {!isLoading && !error && (
            <ListMovies onSelectID={handleSelecteID} movies={movies} />
          )}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              onAddWatched={handleAddWatchedMovie}
              id={selectedID}
              onCloseID={handleCloseID}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                onDeleteWatched={handleDeleteWatched}
                watched={watched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function MovieDetails({ id, onCloseID, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const isWatched = watched.map((movie) => movie.imdbID).includes(id);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === id
  )?.userRating;
  function handleWatched() {
    const newWatchedMovie = {
      title,
      poster,
      imdbRating,
      year,
      runtime: +movie.Runtime.split(" ").at(0),
      userRating,
      imdbID: id,
    };
    onAddWatched(newWatchedMovie);
    onCloseID();
  }

  useEffect(function () {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseID();
        console.log("Closing");
      }
    }
    document.addEventListener("keydown", callback);
    return function () {
      document.removeEventListener("keydown", callback);
    };
  });

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [id]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseID}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          {/* <p>{avgRating}</p> */}

          <section>
            <div className="rating">
              {isWatched ? (
                <p>
                  <em>You Rated this Movie {watchedUserRating}⭐️</em>
                </p>
              ) : (
                <>
                  <StarRating
                    maxLength={8}
                    size={28}
                    onUserRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleWatched}>
                      + Add Movie
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <p className="error">
      <span>💥</span> {message}
    </p>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
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
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function ListMovies({ movies, onSelectID }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectID={onSelectID} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movie({ movie, onSelectID }) {
  return (
    <li className="list " onClick={() => onSelectID(movie.imdbID)}>
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

function Main({ children }) {
  return <main className="main">{children}</main>;
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
          <span>{+avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{+avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

// function WatchedList() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && <>
//         <WatchedSummary watched={watched} />
//           <WatchedMovieList watched={watched} />
//       </>}
//     </div>
//   );
// }

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onDeleteWatched={onDeleteWatched}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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
          <span>{movie.runtime} min</span>
        </p>
        <button
          onClick={() => onDeleteWatched(movie.imdbID)}
          className="btn-delete"
        >
          X
        </button>
      </div>
    </li>
  );
}
