const atobSafe = (base64) => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(base64);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("binary");
  }
  throw new Error("No base64 decode available in this environment");
};

const base64UrlDecode = (str) => {
  if (typeof str !== "string") {
    throw new Error("Invalid token specified: must be a string");
  }

  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("Invalid token specified: invalid base64 string");
  }

  try {
    return decodeURIComponent(
      atobSafe(output)
        .split("")
        .map((c) => {
          const code = c.charCodeAt(0).toString(16).toUpperCase();
          return "%" + (code.length < 2 ? "0" + code : code);
        })
        .join("")
    );
  } catch (error) {
    throw new Error(`Invalid token specified: invalid base64 for part (${error.message})`);
  }
};

export default function jwtDecode(token, options = {}) {
  if (typeof token !== "string") {
    throw new Error("Invalid token specified: must be a string");
  }

  const part = token.split(".")[options.header === true ? 0 : 1];
  if (typeof part !== "string") {
    throw new Error("Invalid token specified: missing token part");
  }

  const decoded = base64UrlDecode(part);
  try {
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`Invalid token specified: invalid json for part (${error.message})`);
  }
}
