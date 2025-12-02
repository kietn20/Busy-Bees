
// Middleware to validate favorite payload in body for add/remove/check
async function requireFavoriteBody(req, res, next) {
  const { courseId, kind, itemId, itemIds } = req.body || {};

  // For bulk-check, itemIds is expected (array). For add/remove, itemId is required.
  const isCheck = Array.isArray(itemIds);

  if (!courseId || !kind) {
    return res.status(400).json({ message: 'courseId and kind are required' });
  }

  if (!['note', 'flashcardSet'].includes(kind)) {
    return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
  }

  if (isCheck) {
    if (!Array.isArray(itemIds)) return res.status(400).json({ message: 'itemIds must be an array' });
    req.favorite = { courseId, kind, itemIds };
  } else {
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });
    req.favorite = { courseId, kind, itemId };
  }

  next();
}

module.exports = {
  requireFavoriteBody,
};
