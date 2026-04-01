export function getInitials(name, fallback = "NA") {
  if (!name?.trim()) return fallback;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

  return initials || fallback;
}