module.exports = (req, res, next) => {
  // schedules API 호환성 처리
  if (req.path.startsWith('/schedules')) {
    // Pagination 호환성 처리
    if (req.query.page !== undefined) {
      req.query._page = parseInt(req.query.page) + 1; // json-server: 1-based, real API : 0-based
      delete req.query.page;
    }
    else {
      req.query._page = 1; // 기본값 설정
    }

    if (req.query.size !== undefined) {
      req.query._limit = req.query.size;
      delete req.query.size;
    }
    else {
      req.query._limit = 10; // 기본값 설정
    }

    if (req.query.startDateTimeAfter) {
      req.query.startDateTime_gte = req.query.startDateTimeAfter;
    }
    if (req.query.startDateTimeBefore) {
      req.query.startDateTime_lte = req.query.startDateTimeBefore;
    }
  }

  if(req.url === "/users-me?401") {
    res.status(401);
  }
  next();
}
