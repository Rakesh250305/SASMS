import { useEffect, useState } from "react";

const getStoredDarkMode = () => localStorage.getItem("darkMode") === "true";

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getStoredDarkMode);

  useEffect(() => {
    const syncDarkMode = () => {
      setDarkMode(getStoredDarkMode());
    };

    window.addEventListener("storage", syncDarkMode);
    window.addEventListener("darkModeChange", syncDarkMode);

    return () => {
      window.removeEventListener("storage", syncDarkMode);
      window.removeEventListener("darkModeChange", syncDarkMode);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const updateDarkMode = (value) => {
    localStorage.setItem("darkMode", String(value));
    setDarkMode(value);
    window.dispatchEvent(new Event("darkModeChange"));
  };

  const toggleDarkMode = () => updateDarkMode(!darkMode);

  return { darkMode, setDarkMode: updateDarkMode, toggleDarkMode };
}
