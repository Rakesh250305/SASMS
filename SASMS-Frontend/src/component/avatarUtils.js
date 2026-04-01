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

export function resolveImageUrl(apiUrl, imagePath) {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("blob:")) return imagePath;

  const baseUrl = (apiUrl || "").replace(/\/+$/, "");
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
}
