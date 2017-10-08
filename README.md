# Sihl

`/síl/`

[![pipeline status][ci-build]][commit] [![coverage report][ci-cov]][commit] [
![npm version][version]][npm]

![Sihl Widget](example/img/sihl-widget.png)

```txt
         _      _
  () o  | |    | |
  /\    | |    | |
 /  \|  |/ \   |/
/(__/|_/|   |_/|__/

Sihl; ScrollirIs Honest readability refLector
```

**Sihl** idnicates text readability heatmap data which is tracked based on the
scroll event in a gentlemanly manner by [Siret](
https://gitlab.com/lupine-software/siret).

This project is text readibility indicator by [Scrolliris](
https://about.scrolliris.com).  
It's called *Scrolliris Readability Reflector* as formal.


## Repository

[https://gitlab.com/lupine-software/sihl](
https://gitlab.com/lupine-software/sihl)


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

```txt
Sihl
Copyright (c) 2017 Lupine Software LLC
```

`GPL-3.0`

The programs in this project are distributed as
GNU General Public License. (version 3)

```txt
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
```

See [LICENSE](LICENSE).


[ci-build]: https://gitlab.com/lupine-software/sihl/badges/master/build.svg
[ci-cov]: https://gitlab.com/lupine-software/sihl/badges/master/coverage.svg
[commit]: https://gitlab.com/lupine-software/sihl/commits/master
[version]: https://img.shields.io/npm/v/@lupine-software/scrolliris-readability-reflector.svg
[npm]: https://www.npmjs.com/package/@lupine-software/scrolliris-readability-reflector
