(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"D:\\ksana2015\\dualfilter-gcd\\index.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
require("ksana2015-webruntime/livereload")(); 
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("dualfilter-sample",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=ReactDOM.render(Main,document.getElementById("main"));
});
},{"./src/main.jsx":"D:\\ksana2015\\dualfilter-gcd\\src\\main.jsx","ksana2015-webruntime/ksanagap":"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","ksana2015-webruntime/livereload":"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","react":"react","react-dom":"react-dom"}],"D:\\ksana2015\\dualfilter-gcd\\src\\main.jsx":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var ksa=require("ksana-simple-api");
var DualFilter=require("ksana2015-dualfilter").Component;
var HTMLFileOpener=require("ksana2015-htmlfileopener").Component;
var utils=require("./utils");
var db="gcd";
var styles={
  container:{display:"flex"}
  ,dualfilter:{flex:1,height:"100%",overflowY:"auto"}
  ,rightpanel:{flex:3}
  ,input:{fontSize:"100%",width:"100%"}
  ,bodytext:{outline:0}
  ,link:{cursor:"pointer",borderBottom:"1px solid blue"}
  ,selectedLink:{cursor:"pointer",background:"yellow"}
  ,title:{fontFamily:"DFKai-SB"}
}
var maincomponent = React.createClass({displayName: "maincomponent",
  getInitialState:function() {
    return {items:[],hits:[],itemclick:" ",text:"",q:"",uti:"",localmode:false,ready:false,links:[],
    tofind1:localStorage.getItem("tofind1")||"ག$",q:localStorage.getItem("q")||"དག"};
  }
  ,componentDidMount:function() {
    ksa.tryOpen(db,function(err){
      if (!err) {
        this.setState({ready:true});
      } else {
        this.setState({localmode:true});
      }
    }.bind(this));
  }
  ,onFilter:function(tofind1,q) {
    ksa.filter({db:db,regex:tofind1,q:q},function(err,items){
      localStorage.setItem("tofind1",tofind1);
      localStorage.setItem("q",q);
      this.setState({items:items,q:q,tofind1:tofind1},function(){
        this.fetchText(items[0]);
      }.bind(this));
    }.bind(this));
  }
  ,fetchText:function(uti){
    ksa.fetch({db:db,uti:uti,q:this.state.q},function(err,content){
      if (!content || !content.length) return;
      this.setState({uti:uti,text:content[0].text,hits:content[0].hits,text2:"",link:"",links:[]},function(){
        this.refs.bodytext.contentEditable=true;
      }.bind(this));  
    }.bind(this));
  }
  ,fetchText2:function(uti){
    if (!uti)return;
    ksa.fetch({db:db,uti:uti},function(err,content){
      if (!content || !content.length) return;
      this.setState({link:uti,text2:content[0].text});
    }.bind(this));
  }
  ,onItemClick:function(e) {
    this.fetchText(e.target.innerHTML);
  }
  ,renderText:function() {
    return ksa.renderHits(this.state.text,this.state.hits,E.bind(null,"span"));
  }
  ,onFileReady:function(files) {
    this.setState({localmode:false,ready:true});
    db=files[db];//replace dbid with HTML File handle
  }
  ,renderOpenKDB:function() {
    if (!this.state.localmode)return React.createElement("div", null, "Loading ", db);
    return React.createElement("div", null, 
      React.createElement("h2", null, "Dual Filter DEMO for Moedict"), 
      React.createElement(HTMLFileOpener, {onReady: this.onFileReady}), 
      React.createElement("br", null), "Google Chrome Only", 
      React.createElement("br", null), React.createElement("a", {target: "_new", href: "https://github.com/ksanaforge/dualfilter-sample"}, "Github Repo")
    )
  }
  ,bodytextmouseup:function(e) {
    var offset=utils.getCaretCharacterOffsetWithin(this.refs.bodytext);
    var cursortext=this.state.text.substr(offset).match(/[\u0f40-\u0fff]*/);
    if (!cursortext)return;
    var res=utils.tryEntry(db,cursortext[0],function(res){
      this.setState({links:res});
      this.fetchText2(res[0]);
    }.bind(this));
  }
  ,golink:function(e) {
    this.fetchText2(e.target.innerHTML);
  }
  ,renderLink:function(item,idx) {
    var style=(item===this.state.link)?styles.selectedLink:styles.link;
    return React.createElement("span", {key: idx}, React.createElement("span", {style: style, onClick: this.golink}, item), " ")
  }
  ,render: function() {
    if (!this.state.ready) return this.renderOpenKDB();
    return React.createElement("div", {style: styles.container}, 
      React.createElement("div", {style: styles.dualfilter}, 
        React.createElement(DualFilter, {items: this.state.items, hits: this.state.hits, 
          inputstyle: styles.input, 
          tofind1: this.state.tofind1, 
          tofind2: this.state.q, 
          onItemClick: this.onItemClick, 
          onFilter: this.onFilter})
      ), 
      React.createElement("div", {style: styles.rightpanel}, 
        React.createElement("h2", {style: styles.title}, this.state.uti), 
        React.createElement("div", {onMouseUp: this.bodytextmouseup, ref: "bodytext", style: styles.bodytext}, this.renderText()), 
        this.state.links.map(this.renderLink), 
        React.createElement("div", {ref: "bodytext2"}, this.state.text2)
      )
    )    
  }
});
module.exports=maincomponent;
},{"./utils":"D:\\ksana2015\\dualfilter-gcd\\src\\utils.js","ksana-simple-api":"ksana-simple-api","ksana2015-dualfilter":"D:\\ksana2015\\node_modules\\ksana2015-dualfilter\\index.js","ksana2015-htmlfileopener":"D:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\index.js","react":"react"}],"D:\\ksana2015\\dualfilter-gcd\\src\\utils.js":[function(require,module,exports){

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
},{"ksana-simple-api":"ksana-simple-api"}],"D:\\ksana2015\\node_modules\\ksana2015-dualfilter\\dualfilter.js":[function(require,module,exports){
var React=require("react");
var ReactList=require("react-list");
var E=React.createElement;
var PT=React.PropTypes;

var styles={
  item:{cursor:"pointer"}
}
var DualFilter=React.createClass({
  getInitialState:function(){
    return {tofind1:this.props.tofind1||"",tofind2:this.props.tofind2||""};
  }
  ,componentDidMount:function() {
    if (this.state.tofind1||this.state.tofind2) {
      this.preparesearch();
    }
  }
  ,getDefaultProps:function(){
    return {items:[],hits:[],vpos:[]};
  }
  ,propTypes:{
    items:PT.array.isRequired
    ,hits:PT.array
    ,vpos:PT.array
    ,onFilter:PT.func.isRequired
    ,onItemClick:PT.func.isRequired
    ,inputstyle:PT.object
    ,inputclass:PT.oneOfType([PT.string, PT.func])

  }
  ,renderItem:function(i,idx){
    var hit=(this.props.hits[i]||[]).length||"";
    var vpos=this.props.vpos[i]||0;
    return E("div",{key:idx,style:styles.item
      ,"data-vpos":vpos
      ,"data-hit":hit
      ,onClick:this.props.onItemClick},this.props.items[i]);
  }
  ,preparesearch:function() {
    clearTimeout(this.timer);
    this.timer=setTimeout(function(){
      this.props.onFilter(this.state.tofind1,this.state.tofind2);
    }.bind(this),500);    
  }
  ,onChange1:function(e) {
    this.setState({tofind1:e.target.value});
    this.preparesearch();
  }
  ,onChange2:function(e) {
    this.setState({tofind2:e.target.value});
    this.preparesearch();
  }
	,render:function() {
    var Input=this.props.inputclass||"input";
		return E("div",null,
      E(Input,{placeholder:"regular expression",style:this.props.inputstyle,value:this.state.tofind1,onChange:this.onChange1})
      ,E("br")
      ,E(Input,{placeholder:"full text search",style:this.props.inputstyle,value:this.state.tofind2,onChange:this.onChange2})
      ,E("br")
      ,E("span",null,"match count:",this.props.items.length)
      ,E("br")
      ,E(ReactList,{itemRenderer:this.renderItem,length:this.props.items.length})
    )
	}
})
module.exports=DualFilter;
},{"react":"react","react-list":"react-list"}],"D:\\ksana2015\\node_modules\\ksana2015-dualfilter\\index.js":[function(require,module,exports){
module.exports={Component:require("./dualfilter")};
},{"./dualfilter":"D:\\ksana2015\\node_modules\\ksana2015-dualfilter\\dualfilter.js"}],"D:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\htmlfileopener.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var styles={
	ready:{backgroundColor:"green",color:"yellow"}
}
var getFilesFromKsanajs=function() {
	var o={};
	ksana.js.files.map(function(file){
		if (file.substr(file.length-4)!==".kdb") return;
		kdbid=file.substr(file.lastIndexOf("/")+1);
		kdbid=kdbid.substr(0,kdbid.length-4);

		o[kdbid]=file;
	});
	return o;
}
var HTMLFileOpener=React.createClass({
	propTypes:{
		files:PT.object // { kdbid:url}
		,onReady:PT.func.isRequired
	}
	,getInitialState:function() {
		return {ready:{} };
	}
	,renderStatus:function(kdbid,url) {
		if(this.state.ready[kdbid]){
			return E("span",{style:styles.ready},"Ready");
		} else {
			return E("span",null,E("a",{href:url},"Download "));
		}
	}
	,renderFileStatus:function(){
		var o=[];
		for (var kdbid in this.props.files) {
			var url=this.props.files[kdbid];
			o.push(E("div",{key:kdbid},kdbid+".kdb ",this.renderStatus(kdbid,url)));
		}
		return o;
	}
	,getDefaultProps:function(){
		return {files:getFilesFromKsanajs()};
	}
	,openFile:function(e) {
		var files=e.target.files;
		var ready=this.state.ready;
		for (var i=0;i<files.length;i++) {
			var kdbid=files[i].name;
			kdbid=kdbid.substr(0,kdbid.length-4);
			if (this.props.files[kdbid]) {
				ready[kdbid]=files[i];
			}
		}
		if (Object.keys(ready).length==Object.keys(this.props.files).length) {
			this.props.onReady(ready);
		}
		this.setState({ready:ready});
	}
	,render:function() {
		var opts={type:"file", accept:".kdb", onChange:this.openFile}
		if (Object.keys(this.props.files).length>1) opts.multiple="multiple";
    return E("div",null
    	, this.renderFileStatus()
    	, E("input",opts)
    	,"click download if you don't have the kdb on your disk"
    );
	}
});
module.exports=HTMLFileOpener;
},{"react":"react"}],"D:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\index.js":[function(require,module,exports){
module.exports={Component:require("./htmlfileopener")};
},{"./htmlfileopener":"D:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\htmlfileopener.js"}],"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			}
	};
	xhr.send();
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ;
				},function(e){
					console.log("failed",e)
				});
		 },this);
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, {create: false, exclusive: false},function(fileEntry) {
		fileEntry.file(function(file){
			var reader = new FileReader();
			reader.onloadend = function(e) {
				if (cb) cb.call(cb,this.result);
			};
			reader.readAsText(file,"utf8");
		});
	}, console.error);
}

function createDir(rootDirEntry, folders,  cb) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }
  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      createDir(dirEntry, folders.slice(1),cb);
    } else {
			cb();
		}
  }, cb);
};


var writeFile=function(filename,buf,cb,context){
	var write=function(fileEntry){
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.write(buf);
			fileWriter.onwriteend = function(e) {
				if (cb) cb.apply(cb,[buf.byteLength]);
			};
		}, console.error);
	}

	var getFile=function(filename){
		API.fs.root.getFile(filename, {exclusive:true}, function(fileEntry) {
			write(fileEntry);
		}, function(){
				API.fs.root.getFile(filename, {create:true,exclusive:true}, function(fileEntry) {
					write(fileEntry);
				});

		});
	}
	var slash=filename.lastIndexOf("/");
	if (slash>-1) {
		createDir(API.fs.root, filename.substr(0,slash).split("/"),function(){
			getFile(filename);
		});
	} else {
		getFile(filename);
	}
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota,
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota(
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;

},{}],"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
var appname="installer";
if (typeof ksana=="undefined") {
	window.ksana={platform:"chrome"};
	if (typeof process!=="undefined" && 
		process.versions && process.versions["node-webkit"]) {
		window.ksana.platform="node-webkit";
	}
}
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}


var loadKsanajs=function(){

	if (typeof process!="undefined" && !process.browser) {
		var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
		downloader=require("./downloader");
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		rootPath=process.cwd();
		rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
		ksana.ready=true;
	} else{
		var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
		jsonp(url,appname,function(data){
			ksana.js=data;
			ksana.ready=true;
		});
	}
}

loadKsanajs();

var boot=function(appId,cb) {
	if (typeof appId=="function") {
		cb=appId;
		appId="unknownapp";
	}
	if (!ksana.js && ksana.platform=="node-webkit") {
		loadKsanajs();
	}
	ksana.appId=appId;
	var timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				cb();
			}
		});
}


var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	boot:boot
}
module.exports=ksanagap;
},{"./downloader":"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if(window.location.origin.indexOf("//127.0.0.1")===-1) return;

	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"D:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}]},{},["D:\\ksana2015\\dualfilter-gcd\\index.js"])
//# sourceMappingURL=bundle.js.map
