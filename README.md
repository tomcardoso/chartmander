# Chartmander

A slackbot that [replies with a summary](https://twitter.com/tom_cardoso/status/626488575706722304), based on a [Chart Tool](http://www.github.com/globeandmail/chart-tool) chart link.

![Charmander](http://vignette1.wikia.nocookie.net/pokemon/images/9/96/004Charmander_OS_anime.png/revision/latest?cb=20140603214902)


## Setup

You'll need a Slack API token, the address to your Chart Tool install, and optionally an [Imgur API ID](https://api.imgur.com/oauth2/addclient) (assuming you don't have AWS upload enabled).

Once you have those, create a `config.json` in the main Chartmander directory and fill it in like so:

```
{
  "token": "token goes here",
  "imgur": "optional imgur ID, leave this empty if you have AWS image upload enabled",
  "address": "http://charts.example.com/"
}
```

After that, `npm install`, then run `node index.js` or `npm run`, and that's it.
