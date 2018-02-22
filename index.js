/**
 * @author Gaurav Nelson
 * @copyright 2018 Gaurav Nelson
 * @module googlestyleguide
 * @fileoverview
 *   check input against word list (Google Developer Documentation Style Guide)
 */

"use strict";

/* Dependencies. */
var keys = require("object-keys");
var difference = require("lodash.difference");
var nlcstToString = require("nlcst-to-string");
var search = require("nlcst-search");
var position = require("unist-util-position");
var findBefore = require("unist-util-find-before");
var findAfter = require("unist-util-find-after");
var patterns = require("./index.json");
var quotation = require("quotation")

/* Expose. */
module.exports = googlestyleguide;

var list = keys(patterns);

//to remove passed values from the array, used to find and remove empty vlaues
function removeA(arr) {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
}

// to check number of words in an array
function countWords(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
  s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
  s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
  return s.split(" ").length;
}

//to check if all values in the array are same
var contains = function(needle) {
  // Per spec, the way to identify NaN is that it is not equal to itself
  var findNaN = needle !== needle;
  var indexOf;

  if (!findNaN && typeof Array.prototype.indexOf === "function") {
    indexOf = Array.prototype.indexOf;
  } else {
    indexOf = function(needle) {
      var i = -1,
        index = -1;

      for (i = 0; i < this.length; i++) {
        var item = this[i];

        if ((findNaN && item !== item) || item === needle) {
          index = i;
          break;
        }
      }

      return index;
    };
  }

  return indexOf.call(this, needle) > -1;
};

function googlestyleguide(options) {
  var ignore = (options || {}).ignore || [];
  var phrases = difference(list, ignore);

  return transformer;
  //allow dashes to compare words with hyphen
  function transformer(tree, file) {
    search(tree, phrases, finder, {
      allowDashes: true
    });

    function finder(match, index, parent, phrase) {
      var pattern = patterns[phrase];
      var replace = pattern.replace;
      var value = nlcstToString(match);
      var data = pattern.data;
      var reason;
      var message;
      //dynamic message source
      var convention = pattern.convention;

      var matchedWord = value.toString(); //.toLowerCase().trim(); //this is what triggered the error
      var replaceWord = replace.toString(); //.toLowerCase().trim(); // this is correct value
      //console.log("MATCHED: ", value.toString())
      //console.log("REPALCE wITH: ", replace.toString())

      var fMulti = matchedWord.match(/^.(\w)+/g); //find the first word in matched word
      var LMulti = matchedWord.match(/\s(\w+)$/g); //find the last word in matched word

      //if matched word is a single word, there is no last word (null)
      if (LMulti != null) {
        LMulti = LMulti.toString().trim();
        //console.log("fMULTI: ", fMulti.toString());
        //console.log("LMulti: ", LMulti.toString());
      }

      var finalMatches = [];

      //check if the replace word contains the matched words
      //in this case we need to also lookout for words before and after matched words.
      if (
        replaceWord.includes(matchedWord) &&
        replaceWord.length == matchedWord.length
      ) {
        //console.log("REPLACE wORD InCLUDES MATCHED!")
        //lets get the repace word in an array
        var checkValueArr = [];
        checkValueArr = replaceWord.split(" ");
        //remove empty values
        removeA(checkValueArr, "");

        //remove instances where replace = match and it is a single word
        if (
          countWords(replaceWord) == 1 &&
          replaceWord.length == matchedWord.length
        ) {
          //do nothing, this means matched word and replaced word are same
        } else {
          if (countWords(matchedWord) == 1) {
            //that is lats word is same as the first word, which means we are dealing with just one word
            LMulti = fMulti;
          }

          //find how many words are before the matched word in replace and how many are after that

          //get position of the first word in replace words
          var firstWordIndex = checkValueArr.findIndex(function(x) {
            return x == fMulti;
          });
          //get position of last word in replace words
          var lastWordIndex = checkValueArr.findIndex(function(x) {
            return x == LMulti;
          });

          var noOfWordsAfter;
          var noOfWordsBefore;

          //how many words are before the matched words in replace word
          noOfWordsBefore = firstWordIndex;

          if (lastWordIndex < 0) {
            //for single word there are no words after it.
            noOfWordsAfter = 0;
          } else {
            if (noOfWordsBefore != 0) {
              noOfWordsAfter = checkValueArr.length - lastWordIndex - 1;
            } else {
              noOfWordsAfter = checkValueArr.length - 1;
            }
          }

          //console.log("There are " + noOfWordsBefore + " words before matched word, and " + noOfWordsAfter + " words after it.")

          if (noOfWordsBefore > 0) {
            var sampleSizeArray = checkValueArr.slice(0, noOfWordsBefore);
            sampleSizeArray.reverse();
            //console.log(sampleSizeArray)
            var previousNode = findBefore(parent, match[0], "WordNode");
            for (var i = 0; i < sampleSizeArray.length; i++) {
              if (previousNode != null) {
                var compareValue1 = nlcstToString(previousNode).toLowerCase();
                compareValue1 = compareValue1.replace(/\s+/g, "");
                var compareValue2 = sampleSizeArray[i];
                compareValue2 = compareValue2.replace(/\s+/g, "");
                if (compareValue1 == compareValue2) {
                  finalMatches.push(true);
                } else finalMatches.push(false);
                previousNode = findBefore(parent, previousNode, "WordNode");
              } else {
                //this means it is the first word, we will show error
                finalMatches.push(false);
              }
            }
          }
          if (noOfWordsAfter > 0) {
            var sampleSizeArray = checkValueArr.slice(noOfWordsAfter);
            //console.log(sampleSizeArray)
            var afterNode = findAfter(parent, match[0], "WordNode");
            for (var i = 0; i < sampleSizeArray.length; i++) {
              if (afterNode != null) {
                var compareValue1 = nlcstToString(afterNode).toLowerCase();
                compareValue1 = compareValue1.replace(/\s+/g, "");
                var compareValue2 = sampleSizeArray[i];
                compareValue2 = compareValue2.replace(/\s+/g, "");
                if (compareValue1 == compareValue2) {
                  finalMatches.push(true);
                } else finalMatches.push(false);
                afterNode = findAfter(parent, afterNode, "WordNode");
              }
            }
          }
        }

        var checkifAllTrue = contains.call(finalMatches, false);
        if (!checkifAllTrue) {
          //this means the matched word and the words before or after it are same
          //therefore do nothing
        } else {
          if ((!replace.length) || (replace[0] === "")) {
            reason = data[0];
          } else {
            reason =
              data[0] +
              " Replace with " +
              quotation(replace, "“", "”").join(", ") +
              ".";
          }

          message = file.warn(reason, {
            start: position.start(match[0]),
            end: position.end(match[match.length - 1])
          });

          message.ruleId = phrase.replace(/\s+/g, "-").toLowerCase();
          message.source = convention;
          message.actual = value;
          message.expected = replace;
        }
      } else {
        // replaced words and matched words are different thus do the normal error reporting
        if ((!replace.length) || (replace[0] === "")) {
          reason = data[0];
        } else {
          reason =
            data[0] +
            " Replace with " +
            quotation(replace, "“", "”").join(", ") +
            ".";
        }

        message = file.warn(reason, {
          start: position.start(match[0]),
          end: position.end(match[match.length - 1])
        });

        message.ruleId = phrase.replace(/\s+/g, "-").toLowerCase();
        message.source = "googlestyleguide";
        message.actual = value;
        message.expected = replace;
      }
    }
  }
}
