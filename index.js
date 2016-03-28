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
    isURL = require("is-url"),
    config = require("./config.json");

// Starting up the bot
var slack = new slackAPI({ 'token': config.token, 'logging': true, 'autoReconnect': true });

var useImgur, channel;

var now = new Date().getTime(); // grab a timestamp from when bot first started

if (config.imgur) { useImgur = true; }

function getChart(chartId, channel) {

  var chartOptions = {
    uri: config.address + "/api/get/" + chartId,
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10
  };

  request(chartOptions, function chartResponse(error, response, body) {
    if (!error && response.statusCode == 200 && body !== '') {
      var jsonBody = JSON.parse(body);
      var chartEntry = {};
      chartEntry.img = jsonBody.img;
      chartEntry.slug = jsonBody.slug;
      chartEntry.heading = jsonBody.heading;
      chartEntry.id = jsonBody._id;
      if (isURL(chartEntry.img)) {
        postMessage(chartEntry, chartEntry.img, channel);
      } else if (config.imgur && config.imgur !== "") {
        upload(chartEntry.img.split(',')[1], function(err, res) {
          postMessage(chartEntry, res.data.link, channel);
        });
      } else {
       console.log("No Imgur API key found!");
      }
    }
  });
}

function upload(image, callback) {
  var options = {
    url: 'https://api.imgur.com/3/upload',
    headers: {
      'Authorization': 'Client-ID ' + config.imgur
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
  message += "*Link:* " + config.address + "/chart/edit/" + chartEntry.id + "\n";
  message += "*Thumbnail:* :chart_with_upwards_trend: :chart_with_upwards_trend: :chart_with_upwards_trend: " + imageLink + "\n";

  return slack.sendMsg(channel, message);
}

slack.on('message', function(data) {

  var timeCheck = 0 < ((new Date(Date(data.ts)).getTime() - now) < 5000);

  if (typeof data.text === 'undefined' || timeCheck) { return };

  var re = new RegExp("(?:edit|show)\/([0-9A-Za-z]*)", 'g'),
    str = data.text,
    results;

  while ((results = re.exec(str)) !== null) {
    if (results[1]) {
      getChart(results[1], data.channel);
    }
  }

});
