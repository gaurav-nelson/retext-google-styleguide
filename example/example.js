import {retext} from 'retext'
import googlestyleguide from 'retext-google-styleguide';
import pkg from 'to-vfile'
const {readSync} = pkg;
import {reporter} from 'vfile-reporter'

retext()
  .use(googlestyleguide)
  .process(readSync('example.txt'), function (err, file) {
    console.error(reporter(err || file));
  });