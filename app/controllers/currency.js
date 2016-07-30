'use strict';

var config = require('../../config/config');

// Set the initial vars
var timestamp = Date.now(),
    delay = config.currencyRefresh * 60000,
    exmoRate = 0,
    coincapRate = 0,coincapFront;

exports.index = function(req, res) {

  var _xhr = function() {
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest !== null) {
      return new XMLHttpRequest();
    } else if (typeof require !== 'undefined' && require !== null) {
      var XMLhttprequest = require('xmlhttprequest').XMLHttpRequest;
      return new XMLhttprequest();
    }
  };

  var _request = function(url, cb) {
    var request;
    request = _xhr();
    request.open('GET', url, true);
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          return cb(false, request.responseText);
        }

        return cb(true, {
          status: request.status,
          message: 'Request error'
        });
      }
    };

    return request.send(null);
  };

  // Init
  var currentTime = Date.now();

  if (exmoRate === 0 ||  currentTime >= (timestamp + delay)) {
    timestamp = currentTime;

    _request('https://api.exmo.com/v1/ticker/', function(err, data) {
      if (!err) {
        if (JSON.parse(data).result === false)
          exmoRate = exmoRate;
        else
          exmoRate = parseFloat(JSON.parse(data).DASH_USD.avg);
      }
    });
  }

  if (coincapRate === 0 ||  currentTime >= (timestamp + delay)) {
    timestamp = currentTime;

    _request('http://www.coincap.io/front', function(err, data) {
      if (!err) coincapFront = JSON.parse(data);
      for (var i=0; i< coincapFront.length; i++) {
        if ( coincapFront[i].short == 'DASH' ) coincapRate = parseFloat(coincapFront[i].price);
      }
    });
  }

  res.jsonp({
    status: 200,
    data: { 
      exmo: exmoRate,
      coincap: coincapRate
    }
  });
};
