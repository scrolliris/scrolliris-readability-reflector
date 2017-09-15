# Sihl

`/síl/`

[![build status](
https://gitlab.com/lupine-software/sihl/badges/master/build.svg)](
https://gitlab.com/lupine-software/sihl/commits/master) [![coverage report](
https://gitlab.com/lupine-software/sihl/badges/master/coverage.svg)](
https://gitlab.com/lupine-software/sihl/commits/master)

![Sihl Widget](
https://gitlab.com/lupine-software/sihl/raw/master/example/img/sihl-widget.png)


```txt
         _      _
  () o  | |    | |
  /\    | |    | |
 /  \|  |/ \   |/
/(__/|_/|   |_/|__/

Sihl; ScrollirIs Honest readability refLector
```

The browser widget of [https://about.scrolliris.com/](
https://about.scrolliris.com/).


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
