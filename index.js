//////////////////////////////////////////////////////////////////
//    ███████╗██╗      █████╗  ██████╗██╗  ██╗  //
//    ██╔════╝██║     ██╔══██╗██╔════╝██║ ██╔╝  //
//    ███████╗██║     ███████║██║     █████╔╝   //
//    ╚════██║██║     ██╔══██║██║     ██╔═██╗   //
//    ███████║███████╗██║  ██║╚██████╗██║  ██╗  //
//    ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝  //
//        14-12-14 | xBytez | me@xbytez.eu    //
//////////////////////////////////////////////////////////////////

// Requiring our module
var slackAPI = require('slackbotapi'),
    request = require("request"),
    config = require("./.config.json");

// Starting
var slack = new slackAPI({
  'token': config.token,
  'logging': true
});

var useImgur,
    imgurId,
    channel;

if (!config.imgur) {
  useImgur = true;
} else {
  imgurId = config.imgur,
}

var address = config.address;

function getChart(chartId, channel) {

  var chartOptions = {
    uri: address + "/api/get/" + chartId,
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10
  };

  request(chartOptions, function chartResponse(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      var chartEntry = {};
      chartEntry.img = jsonBody.img;
      chartEntry.slug = jsonBody.slug;
      chartEntry.heading = jsonBody.heading;
      chartEntry.id = jsonBody._id;
      if (useImgur) {
        upload(chartEntry.img.split(',')[1], function(err, res) {
          postMessage(chartEntry, res.data.link, channel);
        });
      } else {
        postMessage(chartEntry, chartEntry.img, channel);
      }

    }
  });
}

function upload(image, callback) {
  var options = {
    url: 'https://api.imgur.com/3/upload',
    headers: {
      'Authorization': 'Client-ID ' + imgurId
    }
  };
  var post = request.post(options, function(err, req, body) {
    try {
      callback(err, JSON.parse(body));
    } catch (e) {
      callback(err, body);
    }
  });
  var upload = post.form();
  upload.append('type', 'base64');
  upload.append('image', image);
}

function postMessage(chartEntry, imageLink, channel) {

  var message = "*Heading:* " + chartEntry.heading + "\n";
  message += "*Slug:* _" + chartEntry.slug + "_\n";
  message += "*Link:* " + address + "/chart/edit/" + chartEntry.id + "\n";
  message += "*Thumbnail:* :chart_with_upwards_trend: :chart_with_upwards_trend: :chart_with_upwards_trend: " + imageLink + "\n";

  return slack.sendMsg(channel, message);
}

slack.on('message', function(data) {

  if (typeof data.text == 'undefined') { return };

  var re = /(?:edit|show)\/([^\s]*)\//g,
        str = data.text,
        match,
        results = [],
        charts = [];

  var results = str.match(re);

  if (results && results.length) {
    for (var i = results.length - 1; i >= 0; i--) {
      var result = results[i].match(/(?:edit|show)\/([^\s]*)\//i)[1];
      charts.push(result);
    }

    for (var i = charts.length - 1; i >= 0; i--) {
      (function(chartEntry) {
        getChart(chartEntry, data.channel);
      })(charts[i]);
    }
  }

});
