[![license](https://img.shields.io/github/license/bigbluehat/web-annotation-protocol-tester.svg?maxAge=2592000?style=flat-square)](https://github.com/bigbluehat/web-annotation-protocol-tester)

# Web Annotation Protocol Test Client

This is an **experimental** test client for the
[Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/).

### Usage

```sh
$ npm i
$ npm test -- --url=http://localhost:8080/annotations/ # runs all tests
$ # or
$ npm run musts -- --url=http://localhost:8080/annotations/
$ npm run shoulds -- --url=http://localhost:8080/annotations/
```

Alternatively (if you don't like the massive node stack trace mess...):

```sh
$ mocha tests/musts.js --url=http://localhost:8080/annotations/
$ # or
$ mocha tests/shoulds.js --url=http://localhost:8080/annotations/
```

You can also run specific tests by using mocha's built in grep feature:

```sh
$ mocha -g PUT tests/musts.js --url=http://localhost:8080/annotations/
```

### Config

If you'd rather not keep typing the `--url` parameter, you can:

```sh
$ cp config.json.sample config.json
```

And change the `url` parameter to your liking.

### Screenshot

![pretty, right?](screenshot.png)

### License

MIT
