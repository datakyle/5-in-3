# Contributing

New prompts are the best contribution. Fixes and small features are welcome too.

## Writing a good prompt

- **Answerable in 5 seconds by most adults.** "Pixar movies" works. "Pixar directors" doesn't.
- **At least 10 possible answers,** so a second player can't just repeat the first.
- **A twist helps.** "Countries in South America that <em>aren't</em> Brazil" is more fun than "countries in South America." Highlight the twist with `<em>`.
- **Broad appeal.** Avoid prompts that only work in one city or one friend group.
- **Keep it clean** outside After Dark. The game gets played with families.
- **Write your own.** Don't copy prompts from commercial games, apps, or websites. They're someone else's copyrighted work.

## Categories

Categories are loose on purpose. Knowing the category shouldn't make the card easier. Put a prompt wherever it fits best; if it fits nowhere, it's probably a Curveball.

After Dark (`adult: true`) is for adult themes like drinking, dating, and embarrassing stories. Keep it cheeky, not explicit.

## Opening a PR

1. Add your prompts to the right category in `questions.js`.
2. Run `node scripts/check-questions.mjs` and fix anything it flags.
3. Open the pull request. The same check runs automatically.
