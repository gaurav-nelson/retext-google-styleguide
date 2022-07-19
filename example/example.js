import {retext} from 'retext'
import googlestyleguide from 'retext-google-styleguide';
//import {readSync} from 'to-vfile'
import pkg from 'to-vfile'
const {readSync} = pkg;

import {reporter} from 'vfile-reporter'
// var vfile = require('to-vfile');
// var report = require('vfile-reporter');
// var retext = require('retext');
// var googlestyleguide = require('retext-google-styleguide');

retext()
  .use(googlestyleguide)
  .process(readSync('example.txt'), function (err, file) {
    console.error(reporter(err || file));
  });