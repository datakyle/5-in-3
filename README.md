# Name 3 in 5

A pass-the-phone party game. Flip a card, and the player on the spot has five seconds to name three things.

<img src="docs/screenshot.png" alt="A revealed card reading 'Name 3: rivers' with the countdown ring running" width="300">

**Play it:** `https://datakyle.github.io/5-in-3/`

## How to play

1. Add 2 to 12 players and pick how many cards each person gets.
2. The player on the spot taps the card. It flips and the 5-second clock starts.
3. The next player in line reads the card out loud and judges.
4. Three answers before the buzzer earns a point. Pass the phone.

The highest score wins when the cards run out.

## Features

- 140 original prompts, from "animals that start with Q" to "things you'd yell at a referee"
- 2 to 12 players on one phone, no accounts, no install
- Countdown ring, beeps, buzzer, and vibration on phones that support it
- Cards don't repeat until you've seen the whole deck (saved on your device)
- One HTML file plus one question file. No build step, no dependencies

## Run it locally

Open `index.html` in a browser. That's it.

## Add questions

All prompts live in [`questions.js`](questions.js), one per line. Each is shown as "Name 3 …", so write only the part after that:

```js
"animals that start with <em>Q</em>",
```

Then check your list:

```sh
node scripts/check-questions.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for what makes a good prompt.

## Deploy your own copy

Fork this repo, then go to **Settings → Pages → Source: GitHub Actions**. The included workflow publishes the game on every push to `main`.

## License

[MIT](LICENSE). The prompts are original to this project and covered by the same license.

This project isn't affiliated with any commercial "5 second" card game.
