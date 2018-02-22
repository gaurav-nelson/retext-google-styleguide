# retext-google-styleguide
Word usage guidence from Google Developer Documentation Style Guide.

`retext-google-styleguide` is a [retext](https://github.com/wooorm/retext) plugin for the word usage advice from [Google Developer Documentation Style Guide](https://developers.google.com/style/word-list#word-list).  It highlights errors and provide word usage advice.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install retext-google-styleguide
```

## Usage

For the following file, `example.txt`:

```text
For 3-D rotation, abort the app first.
Then hit autoupdate to update the app.
```

And our script, `example.js`, looks as follows:

```javascript
var vfile = require('to-vfile');
var report = require('vfile-reporter');
var retext = require('retext');
var googlestyleguide = require('retext-google-styleguide');

retext()
  .use(googlestyleguide)
  .process(vfile.readSync('example.txt'), function (err, file) {
    console.error(report(err || file));
  });
```

Yields:
```text
example.txt
    1:5-1:8  warning  Do not use. Replace with “3D”.                             3-d         googlestyleguide
  1:19-1:24  warning  Do not use. Replace with “stop”, “exit”, “cancel”, “end”.  abort       googlestyleguide
    2:6-2:9  warning  Don't use as a synonym for "click."                        hit         googlestyleguide
  2:10-2:20  warning  Do not use. Replace with “automatically update”.           autoupdate  googlestyleguide

⚠ 4 warnings

```

## API

### `retext().use(googlestyleguide)`

## Rules
See [index.json](https://github.com/gaurav-nelson/retext-google-styleguide/blob/master/index.json)
