export function getRepoNameFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return parts.slice(-1)[0] || "Unknown";
  } catch {
    return "Invalid URL";
  }
}

export function getRepoOwnerFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return parts.length > 2 ? parts[1] : "Unknown";
  } catch {
    return "Invalid URL";
  }
}