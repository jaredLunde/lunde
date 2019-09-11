# @lunde/create-react-app

A command line tool for creating React apps out of thin air with deployment
strategies for [Now](https://zeit.co), S3 + CloudFront, and AWS Lambda + API 
Gateway. This is a flexible alternative to the original CRA which has very
stringent rules.

## 📦 What's in the ****ing box?

Apps are packaged with a variety of tools necessary for production
React applications.

### Build tools

| Library | Description |
| --- | --- |
| Webpack 4 | For building an serving the application |
| Babel 7 | For compiling jsx and ES6 code to ES5 |
| Jest | For testing components |
| Prettier | For formatting code, READMEs, and configs |
| ESLint | For linting the application |
| Yarn | For deterministic builds and monorepos |
| [build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app) | For configuring, building, and serving your app with Webpack | 
| [render-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/render-react-app) | For server rendering and streaming your app | 
| [deploy-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/deploy-react-app) | For deploying your app to the world | 

### Application structure
[Have a taste of it](lib/shared)

### Output targets
You can configure your app for static and server rendered builds. By default, you're 
getting a scalable SSR solution.

### Routes and pages
Routing is accomplished with [`react-router-dom`](https://reacttraining.com/react-router/web/guides/quick-start). 

### Code splitting
Routes are code split by [`react-broker`](https://github.com/jaredLunde/react-broker) which
is a great tool that also provides component preloading and SSR capabilities 
that `React.lazy` presently lacks.

### Styles and theming
CSS styles and themes are added to components with [`curls`](https://github.com/jaredLunde/curls) and [`style-hooks`](https://style-hooks.jaredlunde.com). 
Both of these are small libraries on top of [`emotion`](https://emotion.sh), so you're getting
that, too, at no cost.

### Static assets
Apps uses [`file-loader`](https://www.npmjs.com/package/file-loader) and [`responsive-loader w/ sharp`](https://www.npmjs.com/package/responsive-loader) 
to include images, fonts, and other files in your bundle assets. When you import a file from your
[`src/assets`](tree/master/src/pages/index.js) directory it will be loaded with `file-loader` when the
extension doesn't match `(jpe?g|png|webm)` and `responsive-loader` when it does.

### Built-in deployment strategies
You can technically deploy your app however you choose, but there are default 
strategies for:
- [Now](https://zeit.co) static sites
- GitHub Pages
- S3 + CloudFront for static sites
- Lambda + API Gateway for dynamic sites

## 🔧 Usage

```shell script
# Use `npx`
npx @lunde/create-react-app my-app --now

# Or install it globally
yarn global add @lunde/create-react-app
create-react-app my-app --aws --static
```

## LICENSE

MIT