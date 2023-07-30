import { useEffect, useState } from "react";
const KEY = "e9027f6a";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setEroor] = useState("");
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
  return { isLoading, movies, error };
}
