# Sihl

`/síl/`

[![build status][gitlab-ci-build]][gitlab-commits] [
![coverage report][gitlab-ci-coverage]][gitlab-commits] [
![npm version][npm-version]][npm-site]

![Sihl Widget](example/img/sihl-widget.png)


```txt
         _      _
  () o  | |    | |
  /\    | |    | |
 /  \|  |/ \   |/
/(__/|_/|   |_/|__/

Sihl; ScrollirIs Honest readability refLector
```

The browser widget of [Scrolliris](https://about.scrolliris.com/).


## Requirements

* Node.js `7.10.1` (build)


## Install

```zsh
: via npm
% npm install @lupine-software/scrolliris-readibility-reflector
```

## Configuration

TODO

See `example/index.html`.

```
settings takes...

* endpointURL
* csrfToken
* canvasJS
* canvasCSS
```


## Development

### Building

```zsh
% gulp build
```

### Testing

```zsh
: run all tests on PhantomJS with coverage (`karma start`)
% npm test

: test task runs all tests {unit|functional} both
% gulp test

: run unit tests
% gulp test:unit

: run functional tests on Electron
% gulp test:func
```


## License

Sihl; Copyright (c) 2017 Lupine Software LLC

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation.

See [LICENSE](LICENSE).


[gitlab-ci-build]: https://gitlab.com/lupine-software/sihl/badges/master/build.svg
[gitlab-ci-coverage]:https://gitlab.com/lupine-software/sihl/badges/master/coverage.svg
[gitlab-commits]: https://gitlab.com/lupine-software/sihl/commits/master
[npm-version]: https://img.shields.io/npm/v/@lupine-software/scrolliris-readability-reflector.svg
[npm-site]: https://www.npmjs.com/package/@lupine-software/scrolliris-readability-reflector
