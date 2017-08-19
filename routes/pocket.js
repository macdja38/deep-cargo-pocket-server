var express = require('express');
var router = express.Router();
const config = require('../config');
const Pocket = require('pocket-promise');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('index');
});

/**
 * Calculates array of urls from input string
 * @param {string} url
 * @param {string} action
 * @param {string} [tags]
 * @param {string} [title]
 * @param {boolean} [tagCheck]
 * @returns {[{action: string, url: string, tag: string, title: string}]}
 */
function getActions(url, action, tags, title, tagCheck) {
  let match = url.match(/{(\d+)-(\d+)}/);
  let urls;
  if (!match) {
    urls = [{url, action, tags, title}];
  } else {
    let smallNum = parseInt(match[1], 10);
    let bigNum = parseInt(match[2], 10);
    urls = [];
    for (let i = smallNum; i <= bigNum; i++) {
      const actionInstance = {url: url.replace(/{\d+-\d+}/, i), action};
      if (tags) {
        let tagArray = tags.split(",").map(t => t.trim());
        if (tagCheck) {
          tagArray.push(`c${i}`);
        }
        actionInstance.tags = tagArray.join(",");
      }
      if (title) {
        actionInstance.title = `${title} - ${i}`;
      }
      urls.push(actionInstance)
    }
  }
  return urls;
}

router.post('/add', function (req, res, next) {
  console.log(req.body);
  let rawURL = req.body.urls;

  const actions = getActions(rawURL, "add", req.body.tags, req.body.title, req.body.tagCheck);

  const pocket = new Pocket({consumer_key: config.POCKET_CONSUMER_KEY, access_token: req.user.accessToken});

  console.log("actions", actions);

  pocket.modify({actions}).then(result => {
    console.log(result);
    res.json(result)
  }).catch((error) => {
    console.error(error);
    res.sendStatus(500);
  });
});

module.exports = router;
