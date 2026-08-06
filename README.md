# daan.fyi

This is the source code of daan.fyi, my personal website. You are free to do with it whatever you
want, as long as you give me proper attribution. You are encouraged to learn from it and build
upon it.

## Tech stack

This website is built on the following tech stack:

- [Astro](https://astro.build/) as the framework, doing static site generation. No client-side
  framework — the only JavaScript shipped is two small inline scripts, for the colour-mode
  toggle and the mobile nav
- [Tailwind CSS](https://tailwindcss.com/) for styling, driven by a set of semantic design
  tokens rather than utility classes at the call site
- I write content in [MDX](https://mdxjs.com/), which combines the power of Markdown and JSX to
  enable rich and interactive content. I use the [unified stack](https://unifiedjs.com/) (incl.
  remark and rehype) to interpret and render the Markdown bits
- [Shiki](https://shiki.style/) for syntax highlighting, with hand-ported themes

This site is deployed on [Vercel](https://vercel.com/)

> The site previously ran on Next.js and Chakra UI. `MIGRATION.md` is a full record of the move —
> the plan, what broke, and why a number of things are written the way they are.

## Prerequisites

You need the following to build, run and develop this site locally:

- [NodeJS](https://nodejs.org/) 22.12 or newer
- [NPM](https://docs.npmjs.com/cli)

## How to build and run

First install all dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

You can make a production build like this:

```bash
npm run build
```

Now you can serve the production build:

```bash
npm run preview
```

Type checking across both `.astro` and `.ts` files:

```bash
npm run type-check
```

## Acknowledgments

When building this website, there were a few websites that inspired me and/or helped me with actual
solutions to coding problems (yay for open source!):

- [Alyssa X](https://alyssax.com/)
- [Lee Robinson](https://leerob.io/)
- [Josh W. Comeau](https://www.joshwcomeau.com/)
- [Marcel Krcah](https://marcel.is/)

Thanks for the inspiration!
