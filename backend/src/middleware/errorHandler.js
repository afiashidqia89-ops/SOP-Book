// Penanganan error terpusat — format respons konsisten
export function errorResponse(status, message, details) {
  return { success: false, error: { status, message, ...(details ? { details } : {}) } };
}

export function notFound(req, res) {
  res.status(404).json(errorResponse(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
}

export function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  // Error dari multer (upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json(errorResponse(413, "Ukuran file melebihi batas 25 MB"));
  }

  // Error dari Prisma (mis. unique constraint)
  if (err.code === "P2002") {
    return res.status(409).json(errorResponse(409, `Data duplikat pada field: ${err.meta?.target?.join(", ")}`));
  }
  if (err.code === "P2025") {
    return res.status(404).json(errorResponse(404, "Data tidak ditemukan"));
  }

  res.status(err.status || 500).json(errorResponse(err.status || 500, err.message || "Kesalahan internal server"));
}
