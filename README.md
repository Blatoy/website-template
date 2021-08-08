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
- Setup database

## Notes

- Everything in `client/static` is copied into the public folder
- Routes specified in `server/routes.json` will serve `index.html` to make the SPA work
- `prod` and `dev` build have the same architecture:
  - client/
    - build/
    - \<content of static folder>
  - server/
    - build/
- client/tsconfig.json is only useful for error detection, client ts compilation is done by `esbuild` and most options are ignored
- server and clients dependencies are separated but devDepencies are not

## Migrations

Generating and running migrations requires the project to be built. In dev environment, `TYPEORM_SYNCHRONIZE` can be set to true.

- Generate: `npm run migration:generate -- <name>`
- Run: `npm run migration:run -- <name>`

TypeORM CLI is accessible using `npm run typeorm`

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