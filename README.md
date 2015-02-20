url-body-stream
==================

Takes an array of URLs and creates a stream that emits the bodies retrieved from those URLs.

Installation
------------

    npm install url-body-stream

Usage
-----

    var createURLHeadwaters = require('url-body-stream').create;

    var headwaters = createURLHeadwaters({
      authParams: {
        user: 'basicauth-username',
        pass: 'basicauth-password'
      }
    });

    // You can leave out authParams if you don't need basic http auth.

    var bodyStream = headwaters.createURLBodyStream({
      urls: [
        'http://google.com',
        'http://smidgeo.com/plan',
        'https://api.github.com/repos/jimkang/url-body-stream/commits/"
      ]
    });

    bodyStream.on('data', function logData(body) {
      console.log('A body I received via http:', body);
    });

    bodyStream.on('end', function onEnd() {
      console.log('Done getting bodies from the URLs.');
    });

Tests
-----

Run tests with `make test`.

License
-------

MIT.
