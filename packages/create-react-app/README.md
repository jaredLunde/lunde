# @lunde/create-react-app

A command line tool for creating React apps out of thin air with deployment
strategies for [Now](https://zeit.co), S3 + CloudFront, and AWS Lambda + API 
Gateway. This is a flexible alternative to the original CRA which has very
stringent rules.

## 📦 What's in the ****ing box?

This tools is packaged with a variety of tools necessary for production
React applications.

### Build tools

| Library | Description |
| --- | --- |
| Webpack 4 | For building an serving the application |
| Babel 7 | For compiling jsx and ES6 code to ES5 |
| Jest | For testing components |
| Prettier | For formatting code, READMEs, and configs |
| ESLint | For linting the application |
| Yarn | For deterministic builds |
| [build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app) | For configuring, building, and serving your app with Webpack | 

### Output targets
You can configure your app for `static` and `server` builds. SSR support comes out
of the box for both `static` and `server builds.

### Routes and pages
Routing is accomplished with [`react-router-dom`](https://reacttraining.com/react-router/web/guides/quick-start). 

### Code splitting
Routes are code split by [`react-broker`](https://github.com/jaredLunde/react-broker) which
is a great tool that also provides component preloading and SSR capability.

### Styles and theming
CSS styles and themes are added to components with [`curls`](https://github.com/jaredLunde/curls) and [`style-hooks`](https://style-hooks.jaredlunde.com). 
Both of these are small libraries on top of [`emotion`](https://emotion.sh).

### Static assets
This app uses [`file-loader`](https://www.npmjs.com/package/file-loader) and [`responsive-loader`](https://www.npmjs.com/package/responsive-loader) 
to include images, fonts, and other files in your bundle assets. When you import a file from your
[`src/assets`](tree/master/src/pages/index.js) directory it will be loaded with `file-loader` when the
extension doesn't match `(jpe?g|png|webm)` and `responsive-loader` when it does.

### Built-in deployment strategies
You can technically deploy your app however you choose, but there are default 
strategies for:
- [Now](https://zeit.co) static builds
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