# mstrutt.co.uk

Personal homepage of Michael Strutt: [https://mstrutt.co.uk](https://mstrutt.co.uk)

As is the done thing, I've built this site up from scratch to help showcase my skills, picking and choosing the right technologies for the job. For the backend I've decided to write a simple Node.js server using express. I'm using the lightweight and super-fast [Squirrelly](https://squirrelly.js.org/ to handle templating, along with [marked](https://marked.js.org) and [front-matter](https://github.com/jxson/front-matter) so that I can organise my blog in markdown files. On the frontend, I preprocess my CSS with [Sass](http://sass-lang.com/) and then and use [Parcel](https://parceljs.org/) to handle all of the asset bundling. For continuous integration I'm using [Codeship](https://codeship.com), which builds and deploys to a [Digital Ocean](https://www.digitalocean.com/?refcode=49bd26b41a79) VPS I manage.

Is this a little over-architected for what could (probably) be a static site? Yes. But I have plans to go beyond static and to leverage the architecture currently in place to go beyond the capabilities of a static site.

## Setup

The server runs on Node. Check the `.nvmrc` file for the right version to use and install all dependencies

```
nvm use
npm install
```

To start the server in production or development, it's:

```
npm start
```

In development you'll also want the watch-and-build setup from parcel running at the same time

```
npm run develop
```

For a single build of all the content and assets (like part of a deployment) you can run

```
npm run build
```

For just picking up new blog content, there's a command to turn the markdown files into structured and tagged json

```
npm run build-blog
```

All commands and dependencies can be found in `package.json`.
