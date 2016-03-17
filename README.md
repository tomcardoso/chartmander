# Chartmander

A slackbot that [replies with a summary](https://twitter.com/tom_cardoso/status/626488575706722304), based on a [Chart Tool](http://www.github.com/globeandmail/chart-tool) chart link.

## Setup

You'll need a Slack API token, the address to your Chart Tool install, and optionally an imgur ID (assuming you don't have AWS upload enabled).

Once you have those, create a `config.json` in the main Chartmander directory and fill it in like so:

```
{
  "token": "token goes here",
  "imgur": "optional imgur ID, leave this as false if you have AWS image upload enabled",
  "address": "http://charts.theglobeandmail.com/or-whatever"
}
```

After that, `npm install`, then run `node index.js` or `npm run`, and that's it.