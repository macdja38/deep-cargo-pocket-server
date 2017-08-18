var express = require('express');
var router = express.Router();
const config = require('../config');
const Pocket = require('pocket-promise');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('index');
});

router.post('/add', function (req, res, next) {
  console.log(req.body);
  let urls = req.body.urls;
  const pocket = new Pocket({consumer_key: config.POCKET_CONSUMER_KEY, access_token: req.user.accessToken});

  const actions = urls.map(url => ({action: 'add', url: url}));

  console.log(actions);
  const actionString = JSON.stringify(actions);

  console.log(actionString);

  console.log(encodeURIComponent(actionString));
  // pocket.add({url: "http://shiroyukitranslations.com/ztj-chapter-130/"}).then(console.log).catch(console.error);
  pocket.modify({actions: urls.map(url => ({action: 'add', url: url}))}).then(result => {
    console.log(result);
    res.json(result)
  }).catch((error) => {
    console.error(error);
    res.sendStatus(500);
  });
});

module.exports = router;
