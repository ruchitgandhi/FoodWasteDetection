const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index',
    { title: 'Let\'s check out how much food is wasted everyday?',
      description: 'Enter the image url for the wasted plate and the person responsible for it' })
})

module.exports = router
