var common = require('./common');
var fs = require('fs');

//@
//@ ### head([{'-n', \<num\>},] file [, file ...])
//@ ### head([{'-n', \<num\>},] file_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ var str = head({'-n', 1}, 'file*.txt');
//@ var str = head('file1', 'file2');
//@ var str = head(['file1', 'file2']); // same as above
//@ ```
//@
//@ Output the first 10 lines of a file (or the first `<num>` if `-n` is
//@ specified)
function _head(options, files) {
  options = common.parseOptions(options, {
    'n': 'numLines'
  });
  var head = '';
  var pipe = common.readFromPipe(this);

  if (!files && !pipe)
    common.error('no paths given');

  var idx = 1;
  if (options.numLines === true) {
    idx = 2;
    options.numLines = Number(arguments[1]);
  } else if (options.numLines === false) {
    options.numLines = 10;
  }
  files = [].slice.call(arguments, idx);

  if (pipe)
    files.unshift('-');

  files.forEach(function(file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, true);
      return;
    }

    var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');

    head += (contents
      .trimRight()
      .split('\n')
      .slice(0, options.numLines)
      .join('\n') + '\n');
  });

  return new common.ShellString(head, common.state.error);
}
module.exports = _head;
