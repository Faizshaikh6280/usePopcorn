import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedMovie = localStorage.getItem(key);
    return storedMovie ? JSON.parse(storedMovie) : initialState;
  });

  // storing watched movie in Local Storage.
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
