import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  } catch (error) {
    console.warn("Theme provider error:", error);
    // Fallback to render children without theme provider
    return <div className="light">{children}</div>;
  }
}
