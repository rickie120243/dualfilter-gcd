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
var maincomponent = React.createClass({
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
    if (!this.state.localmode)return <div>Loading {db}</div>;
    return <div>
      <h2>Dual Filter DEMO for Moedict</h2>
      <HTMLFileOpener onReady={this.onFileReady}/>
      <br/>Google Chrome Only
      <br/><a target="_new" href="https://github.com/ksanaforge/dualfilter-sample">Github Repo</a>
    </div>
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
    return <span key={idx}><span style={style} onClick={this.golink}>{item}</span> </span>
  }
  ,render: function() {
    if (!this.state.ready) return this.renderOpenKDB();
    return <div style={styles.container}>    
      <div style={styles.dualfilter}>
        <DualFilter items={this.state.items} hits={this.state.hits}
          inputstyle={styles.input}
          tofind1={this.state.tofind1}
          tofind2={this.state.q}
          onItemClick={this.onItemClick}
          onFilter={this.onFilter} />
      </div>
      <div style={styles.rightpanel}>
        <h2 style={styles.title}>{this.state.uti}</h2>
        <div onMouseUp={this.bodytextmouseup} ref="bodytext" style={styles.bodytext}>{this.renderText()}</div>
        {this.state.links.map(this.renderLink)}
        <div ref="bodytext2">{this.state.text2}</div>
      </div>
    </div>    
  }
});
module.exports=maincomponent;