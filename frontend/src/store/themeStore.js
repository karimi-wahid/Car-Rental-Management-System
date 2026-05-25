import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark",
          );
          return { theme: newTheme };
        });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme });
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);

// Initialize theme on app start
if (typeof window !== "undefined") {
  const storedTheme = localStorage.getItem("theme-storage");
  if (storedTheme) {
    const { state } = JSON.parse(storedTheme);
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }
}
