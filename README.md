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

- **640 original prompts** in 9 categories, from "animals that start with Q" to "things you'd yell at a referee"
- **Pick your categories:** Screen & Sound, Around the World, Food & Drink, Game Day, Wild Things, Around the House, Wordplay, People & Past, and Curveballs
- **After Dark (18+):** 86 adult cards about drinking, dating, and bad decisions. Off by default and needs a confirmation to turn on
- **2 to 12 players** on one phone, no accounts, no install
- Countdown ring, beeps, buzzer, and vibration on phones that support it

## How cards avoid repeating

- Every prompt gets a stable ID from its text, so adding new prompts never resets anyone's history.
- A card counts as seen once it's revealed. Seen cards are saved on your device.
- New cards always come first. Once you've seen every card in your chosen categories, the game deals the ones you saw longest ago.
- A card never comes up twice in one game, and categories take turns so you don't get three food cards in a row.
- The setup screen shows how many cards are still new, with a button to reset.

The logic lives in [`deck.js`](deck.js).

## Run it locally

Open `index.html` in a browser. That's it.

## Add questions

All prompts live in [`questions.js`](questions.js), grouped by category. Each is shown as "Name 3 …", so write only the part after that:

```js
"animals that start with <em>Q</em>",
```

Then check your list:

```sh
node scripts/check-questions.mjs
```

The check catches exact and near duplicates, formatting problems, and confirms the deck never repeats a card before the pool runs out.

See [CONTRIBUTING.md](CONTRIBUTING.md) for what makes a good prompt.

## Deploy your own copy

Fork this repo, then go to **Settings → Pages → Source: GitHub Actions**. The included workflow publishes the game on every push to `main`.

## License

[MIT](LICENSE). The prompts are original to this project and covered by the same license.

This project isn't affiliated with any commercial "5 second" card game.
