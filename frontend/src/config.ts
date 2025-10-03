const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl || typeof apiBaseUrl !== "string") {
  throw new Error("VITE_API_BASE_URL is required");
}

export const config = {
  apiBaseUrl
};
