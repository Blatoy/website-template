## About

Basic template for web development 

## Installation

1. Clone the project
2. `npm install`

## Running

### Dev

- `npm start`
- For debugging in VSCode: `ctrl-shift-p > Debug: Toggle Auto Attache > Only With Flag`
- Website should be served on http://localhost:3000

### Testing

- `npm run check`

### Prod

- `npm run build`

## Notes

- Everything in `client/static` is served publicly
- Routes specified in `server/routes.json` will serve `index.html` to make the SPA work
- `prod` and `dev` build have the same architecture:
  - client/
    - build/
    - \<content of static folder>
  - server/
    - build/

## Technologies

- TypeScript
- ESLint (with typescript-eslint)

### Front-end

- React
- SASS
- esbuild


### Back-end

- Node.js
- Next.js