'use strict';
var express = require('express');
var router = express.Router();
var defaultvariable = {
    min : 2000,
    max : 8000,
    pi_name : "مدت توقف",
    pi_unit : "روز",
}
defaultvariable.actual = (defaultvariable.min + defaultvariable.max) / 2;
defaultvariable.target = (defaultvariable.actual + defaultvariable.max) / 2;
defaultvariable.lastyear = (defaultvariable.actual + defaultvariable.min) / 2;
defaultvariable.howtoshow = 'absolute';//relativetotarget relativetolastyear deviation
defaultvariable.drawlastyear = true;
defaultvariable.drawtarget = true;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Clock Indicator Element' });
});
// resource
router.get('/clockindicator/:varid', function (req, res) {
    defaultvariable.id = req.params.varid;
    res.json(defaultvariable);
});
router.post('/clockindicator/:varid', function (req, res) {
    console.log(req.body);
    res.sendStatus(200);
});

module.exports = router;
