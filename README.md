# Sihl

`/síl/`

[![build status]()]() [![coverage report]()]()


```txt
Sihl; ScrollirIs Honest readability refLector
```


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
% gulp test:functional
```


## License

Sihl; Copyright (c) 2017 Lupine Software LLC

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation.

See [LICENSE](LICENSE).
