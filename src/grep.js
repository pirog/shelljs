var common = require('./common');
var fs = require('fs');

//@
//@ ### grep([options,] regex_filter, file [, file ...])
//@ ### grep([options,] regex_filter, file_array)
//@ Available options:
//@
//@ + `-v`: Inverse the sense of the regex and print the lines not matching the criteria.
//@ + `-l`: Print only filenames of matching files
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
//@ grep('GLOBAL_VARIABLE', '*.js');
//@ ```
//@
//@ Reads input string from given files and returns a string containing all lines of the
//@ file that match the given `regex_filter`. Wildcard `*` accepted.
function _grep(options, regex, files) {
  options = common.parseOptions(options, {
    'v': 'inverse',
    'l': 'nameOnly'
  });

  // Check if this is coming from a pipe
  var pipe = common.readFromPipe(this);

  if (!files && !pipe)
    common.error('no paths given');

  files = [].slice.call(arguments, 2);

  if (pipe)
    files.unshift('-');

  var grep = [];
  files.forEach(function(file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, true);
      return;
    }

    var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
    var lines = contents.split(/\r*\n/);
    if (options.nameOnly) {
      if (contents.match(regex))
        grep.push(file);
    } else {
      lines.forEach(function(line) {
        var matched = line.match(regex);
        if ((options.inverse && !matched) || (!options.inverse && matched))
          grep.push(line);
      });
    }
  });

  return new common.ShellString(grep.join('\n')+'\n', common.state.error);
}
module.exports = _grep;
