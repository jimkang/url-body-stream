var _ = require('lodash');
var Readable = require('stream').Readable;
var queue = require('queue-async');
var requestModule = require('request');

function createURLBodyHeadwaters(ctorOpts) {
  var request;
  var authParams;
  var parseJson = false

  if (ctorOpts) {
    if (ctorOpts.request) {
      request = ctorOpts.request;
    }
    if (ctorOpts.authParams) {
      authParams = ctorOpts.authParams;
    }
    if (ctorOpts.parseJson) {
      parseJson = ctorOpts.parseJson;
    }
  }

  if (!request) {
    request = requestModule;
  }

  function createURLBodyStream(opts) {
    if (!opts || !opts.urls) {
      throw new Error('createURLBodyStream not give opts.urls');
    }

    var maxConcurrentRequests = 3;
    if (opts.maxConcurrentRequests) {
      maxConcurrentRequests = opts.maxConcurrentRequests;
    }

    var urls = opts.urls;
    var started = false;

    var stream = Readable({
      objectMode: true
    });

    function makeRequest(url, tellQueueDone) {
      var requestOpts = {
        url: url,
        headers: {
          'user-agent': 'commit-seeker'
        },
      };

      if (authParams) {
        requestOpts.auth = authParams;
      }

      if (parseJson) {
        requestOpts.json = true;
      }

      function saveBodyFromResponse(error, response, body) {
        if (!error) {
          stream.push(body);
        }
        tellQueueDone(error);
      }

      request(requestOpts, saveBodyFromResponse);
    }

    var q = queue(maxConcurrentRequests);

    function queueRequest(url) {
      q.defer(makeRequest, url);
    }

    function endStream(error) {
      if (error) {
        console.log(error, error.stack);
      }
      stream.push(null);
    }

    stream._read = function readFromStream() {
      if (!started) {
        started = true;
        urls.forEach(queueRequest);
        q.awaitAll(endStream);
      }
    };

    return stream;
  }

  return {
    createURLBodyStream: createURLBodyStream
  };
}

module.exports = {
  create: createURLBodyHeadwaters
};
