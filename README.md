# Autocomplete Component

## Live Example:

https://my-react-autocomplete-playground.vercel.app

## How to run locally:

1. `npm install`
2. `npm run dev`

## What used?

- Project setup - https://vitejs.dev, with official [`react-ts` template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)
- [Feather icons](https://feathericons.com/)

## Caveats and what should be improved for production:

- Matching text highliting done by persisting query string + RegExp to split results: this shold be accurately tested for performance
- Consider using virtual scrolling in case if list of resulst might be large (also highliting is important here - should be applied only for currently visibile items)
- Better UX - I didn't have enought time, but wanted to add automatic scroll to selected item on dropdown open
