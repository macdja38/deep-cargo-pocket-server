const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.send(req.user);
});

module.exports = router;
