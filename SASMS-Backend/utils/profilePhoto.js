import fs from "fs";
import path from "path";

export const buildUploadPath = (folder, filename) =>
  `/${folder.replace(/\\/g, "/")}/${filename}`;

export const removeUploadedFile = async (filePath) => {
  if (!filePath) return;

  const normalized = filePath.replace(/^\/+/, "");
  const absolutePath = path.resolve(normalized);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};
