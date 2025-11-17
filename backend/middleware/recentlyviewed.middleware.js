function requireRecentlyViewedBody(req, res, next) {
  const { courseId, kind, itemId } = req.body || {};
  if (!courseId || !kind || !itemId) {
    return res.status(400).json({ message: 'courseId, kind and itemId are required.' });
  }
  if (!['note', 'flashcardSet'].includes(kind)) {
    return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
  }
  next();
}

module.exports = { requireRecentlyViewedBody };