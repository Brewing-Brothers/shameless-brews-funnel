export type ThemeName = "minimal" | "rustic" | "bold" | "organic";

export function getTheme(name: string | undefined): ThemeName {
  if (name === "organic" || name === "rustic" || name === "bold" || name === "minimal") return name;
  return "minimal";
}

export function themeClasses(theme: ThemeName) {
  switch (theme) {
    case "organic":
      return {
        pageBg: "bg-green-50",
        card: "bg-white border border-green-200",
        accent: "text-green-700",
        accentDark: "text-green-900",
        button: "bg-green-700 hover:bg-green-800 text-white",
        buttonOutline: "border-2 border-green-700 text-green-700 hover:bg-green-50",
        badge: "bg-green-100 text-green-800",
        badgePopular: "bg-green-600 text-white",
        urgencyBar: "bg-green-600",
        darkSection: "bg-green-900",
        stickyMobile: "bg-green-700",
        primary: "#16a34a",
        secondary: "#14532d",
        cta: "#166534",
      };
    case "rustic":
      return {
        pageBg: "bg-amber-50",
        card: "bg-white border border-amber-200",
        accent: "text-amber-700",
        accentDark: "text-amber-900",
        button: "bg-amber-700 hover:bg-amber-800 text-white",
        buttonOutline: "border-2 border-amber-700 text-amber-700 hover:bg-amber-50",
        badge: "bg-amber-100 text-amber-800",
        badgePopular: "bg-amber-600 text-white",
        urgencyBar: "bg-amber-600",
        darkSection: "bg-amber-900",
        stickyMobile: "bg-amber-700",
        primary: "#b45309",
        secondary: "#78350f",
        cta: "#92400e",
      };
    case "bold":
      return {
        pageBg: "bg-zinc-950",
        card: "bg-zinc-900 border border-zinc-800",
        accent: "text-lime-300",
        accentDark: "text-lime-400",
        button: "bg-lime-400 hover:bg-lime-300 text-zinc-950",
        buttonOutline: "border-2 border-lime-400 text-lime-400 hover:bg-zinc-900",
        badge: "bg-zinc-800 text-zinc-100",
        badgePopular: "bg-lime-400 text-zinc-950",
        urgencyBar: "bg-lime-500",
        darkSection: "bg-zinc-900",
        stickyMobile: "bg-lime-500",
        primary: "#a3e635",
        secondary: "#1c1917",
        cta: "#84cc16",
      };
    case "minimal":
    default:
      return {
        pageBg: "bg-slate-50",
        card: "bg-white border border-slate-200",
        accent: "text-slate-900",
        accentDark: "text-slate-800",
        button: "bg-slate-900 hover:bg-slate-800 text-white",
        buttonOutline: "border-2 border-slate-900 text-slate-900 hover:bg-slate-50",
        badge: "bg-slate-100 text-slate-700",
        badgePopular: "bg-slate-800 text-white",
        urgencyBar: "bg-slate-800",
        darkSection: "bg-slate-900",
        stickyMobile: "bg-slate-800",
        primary: "#0f172a",
        secondary: "#1e293b",
        cta: "#334155",
      };
  }
}
