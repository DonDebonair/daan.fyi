# daan.fyi

This is the source code of daan.fyi, my personal website. You are free to do with it whatever you
want, as long as you give me proper attribution. You are encouraged to learn from it and build
upon it.

## Tech stack

This website is built on the following tech stack:

-   [React](https://reactjs.org/) as the framework of choice
-   [Chakra UI](https://chakra-ui.com/) for beautiful and easily extensible components
-   I write content in [MDX](https://mdxjs.com/), which combines the power of Markdown and JSX to
    enable rich and interactive content. I use the [unified stack](https://unifiedjs.com/) (incl.
    remark and rehype) to interpret and render the Markdown bits.
-   [NextJS](https://nextjs.org/) is the framework that ties everything together and provide static
    site generation and server-side rendering

This site it deployed on [Vercel](https://vercel.com/)

## Prerequisites

You need the following to build, run and develop this site locally:

-   [NodeJS](https://nodejs.org/)
-   [NPM](https://docs.npmjs.com/cli)

## How to build and run

First install all dependencies:

```bash
npm prepare
npm install
```

Start the development server:

```bash
npm run dev
```

The development server supports hot reloading of NextJS pages. This means that only the React
components that have changed, will be updated live in the page, without completely reloading the
page.

For MDX content, it will actually refresh the whole page.

You can make a production build like this:

```bash
npm run build
```

Now you can run the production build:

```bash
npm run start
```

## Acknowledgments

When building this website, there were a few websites that inspired me and/or helped me with actual
solutions to coding problems (yay for open source!):

-   [Alyssa X](https://alyssax.com/)
-   [Lee Robinson](https://leerob.io/)
-   [Josh W. Comeau](https://www.joshwcomeau.com/)
-   [Marcel Krcah](https://marcel.is/)

Thanks for the inspiration!
