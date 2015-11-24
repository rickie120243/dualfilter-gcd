
/* from http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
*/
var ksa=require("ksana-simple-api");
var indexOfSorted = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};
/* find all possible entry after cursor*/
var tryEntry=function(db,cursortext,cb) {
    var first=cursortext[0],out=[];
    var segnames=ksa.get(db,"segnames",function(segnames){
        var start=indexOfSorted(segnames,first,true);
        while (true) {
            var entry=segnames[start];
            if (cursortext.length>entry.length && cursortext.substr(0,entry.length)===entry) {
                out.push(entry);
            }
            if (start>=segnames.length || entry[0]!==first) break;
            start++;
        }
        out.sort(function(a,b){return b.length-a.length});
        cb(out);
    });
}
var getCaretCharacterOffsetWithin=function (element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}
module.exports={getCaretCharacterOffsetWithin:getCaretCharacterOffsetWithin,tryEntry:tryEntry};