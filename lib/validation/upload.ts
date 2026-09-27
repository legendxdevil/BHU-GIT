export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName: string;
  fileType: "geojson" | "csv" | "json" | "image" | "unsupported";
}

export function validateUploadedFile(file: { name: string; size: number; type?: string }): FileValidationResult {
  const MAX_SIZE_MB = 20;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the configured maximum limit of ${MAX_SIZE_MB}MB.`,
      sanitizedFileName: "",
      fileType: "unsupported",
    };
  }

  // Path Traversal and Name Sanitization
  const rawName = file.name.replace(/\\/g, "/").split("/").pop() || "upload";
  const sanitizedBase = rawName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const ext = sanitizedBase.split(".").pop()?.toLowerCase() || "";

  let fileType: FileValidationResult["fileType"] = "unsupported";
  if (ext === "geojson") fileType = "geojson";
  else if (ext === "csv") fileType = "csv";
  else if (ext === "json") fileType = "json";
  else if (["png", "jpg", "jpeg", "webp"].includes(ext)) fileType = "image";

  if (fileType === "unsupported") {
    return {
      valid: false,
      error: `Unsupported file extension .${ext}. Only .geojson, .csv, .json, and image formats (.png, .jpg) are supported.`,
      sanitizedFileName: sanitizedBase,
      fileType,
    };
  }

  const randomId = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = `source_${randomId}_${sanitizedBase}`;

  return {
    valid: true,
    sanitizedFileName,
    fileType,
  };
}
