const jsonServer = require('json-server');
const router = jsonServer.router('db.json');

module.exports = (req, res, next) => {
  const db = router.db;

  if (req.query.startDateTimeAfter) {
    req.query.startDateTime_gte = req.query.startDateTimeAfter;
  }
  if (req.query.startDateTimeBefore) {
    req.query.startDateTime_lte = req.query.startDateTimeBefore;
  }
  // if (req.query.stellarId) {
  //   req.query.stellarNameKor = db.get("stellars").find(element => element.id === Number(req.query.stellarId)).value()?.nameKor;
  // }
  if(req.url === "/users-me?401") {
    res.status(401);
  }
  next();
}
