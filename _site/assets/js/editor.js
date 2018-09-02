/** @jsx React.DOM */

var cx = React.addons.classSet;

var converter = new Showdown.converter();


// For object with integer keys, return max(keys) + 1 (or 0 if empty)

var nextIntegerKey = function(obj){
  var keys = _.keys(obj).map(function(x){return parseInt(x);});
  if (keys.length) {
    return _.max(keys) + 1;
  } else {
    return 0;
  }
};


// Extend _.indexOf to work with functions instead of values
// Based on http://stackoverflow.com/questions/12356642/

var indexOfValue = _.indexOf; // save a reference to the core implementation

_.mixin({

    // return the index of the first array element passing a test
    indexOf: function(array, test) {
        // delegate to standard indexOf if the test isn't a function
        if (!_.isFunction(test)) return indexOfValue(array, test);
        // otherwise, look for the index
        for (var x = 0; x < array.length; x++) {
            if (test(array[x])) return x;
        }
        // not found, return fail value
        return -1;
    }

});


// CodeMirror component for React
// Based on https://github.com/brigand/react-edit/

var CodeMirrorComponent = React.createClass({

  updateCode: function(){
    // TODO: make scroll position maintain
    this.cm.setValue(this.props.code);
  },

  codeChanged: function(cm){
    // set a flag so this doesn't cause a cm.setValue
    this.userChangedCode = true;
    this.props.onChange && this.props.onChange(cm.getValue());
  },

  componentDidMount: function() {
    this.cm = setupCodeBox(this.getDOMNode());
    this.cm.on("change", this.codeChanged);
    this.cm.on("blur", this.props.onBlur);
    this.cm.on("focus", this.props.onFocus);
    this.updateCode();
  },

  componentDidUpdate: function(){
    this.cm && this.updateCode();
  },

  componentWillUnmount: function(){
    this.cm.off("change", this.codeChanged);
  },

  render: function() {
    return (<div />);
  },

  shouldComponentUpdate: function(nextProps){
    if (this.userChangedCode) {
      this.userChangedCode = false;
      return false;
    }
    return nextProps.code !== this.props.code;
  }
});


var CodeInputBox = React.createClass({

  getInitialState: function(){
    return {hasFocus: false};
  },

  onFocus: function(){
    this.setState({hasFocus: true});
  },

  onBlur: function(){
    this.setState({hasFocus: false});
  },

  render: function(){
    var blockClasses = cx({
      editorBlock: true,
      currentBlock: this.state.hasFocus,
      codeBlock: true
    });
    return (<div className={blockClasses}>
            <pre>
              <CodeMirrorComponent code={this.props.initialCode}
                                   onChange={this.props.updateCode}
                                   onBlur={this.onBlur}
                                   onFocus={this.onFocus} />
            </pre>
            <button className="removeBlock" onClick={this.props.removeMe}>x</button>
            <button className="moveUp" onClick={this.props.moveUp}>▲</button>
            <button className="moveDown" onClick={this.props.moveDown}>▼</button>
           </div>);
  }
});


var MarkdownInputBox = React.createClass({

  getInitialState: function(){
    return {text: this.props.initialText, hasFocus: false};
  },

  setFocus: function(){
    $(this.getDOMNode()).find("textarea").focus();
  },

  onFocus: function(){
    this.setState({hasFocus: true});
  },

  onBlur: function(){
    this.setState({hasFocus: false});
  },

  handleChange: function(event){
    var text = event.target.value;
    this.userChangedText = true;
    this.setState({text: text});
    this.props.updateText(text);
  },

  render: function(){
    var blockClasses = cx({
      editorBlock: true,
      currentBlock: this.state.hasFocus,
      markdownBlock: true
    });
    return (<div className={blockClasses}>
            <button className="removeBlock" onClick={this.props.removeMe}>x</button>
            <button className="moveUp" onClick={this.props.moveUp}>▲</button>
            <button className="moveDown" onClick={this.props.moveDown}>▼</button>
            <textarea onChange={this.handleChange} onFocus={this.onFocus} onBlur={this.onBlur}>{this.state.text}</textarea>
            <div className="preview" onClick={this.setFocus} dangerouslySetInnerHTML={{ __html: converter.makeHtml(this.state.text) }} />
            </div>);
  },

  componentDidMount: function(){
    $(".editorBlock textarea").autosize();
    this.props.updateText(this.state.text);
  },

  componentDidUpdate: function(){
    $(".editorBlock textarea").trigger('autosize.resize');
  },

  shouldComponentUpdate: function(nextProps, nextState){
    if (this.userChangedText){
      this.userChangedText = false;
      return false;
    }
    return (nextState.text != this.state.text) || (nextState.hasFocus != this.state.hasFocus);
  }
});


var getOrderedBlockList = function(originalBlocks){

  // Deep-copy blocks state
  var blocks = $.extend(true, {}, originalBlocks);

  // Add id to block data
  for (var id in blocks){
    blocks[id].id = id;
  }

  // Sort by ordering key
  var blockList = _.values(blocks);
  var orderedBlockList = _.sortBy(blockList, function(block){return block.orderingKey;});

  return orderedBlockList;
};


var MarkdownOutputBox = React.createClass({

  getInitialState: function(){
    return {lastUpdate: (new Date()).getTime()};
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return (((new Date()).getTime() - this.state.lastUpdate) > 500) && (nextProps != this.props);
  },

  render: function(){

    if (!this.props.open){
      return <div></div>;
    }

    // get ordered list of blocks
    var orderedBlocks = getOrderedBlockList(this.props.blocks);

    // generate markdow
    var generatedMarkdown = "";
    orderedBlocks.map(function(block){
      var content = $.trim(block.content);
      if (block.type === "code"){
        generatedMarkdown += "\n\n~~~~\n" + content + "\n~~~~";
      } else if (block.type === "text"){
        generatedMarkdown += "\n\n" + block.content;
      } else {
        console.error("Unknown block type: ", block.type);
      }
    });
    return <textarea id="editorMarkdown" value={$.trim(generatedMarkdown)}></textarea>;
  },

  componentDidMount: function(){
    $('#editorMarkdown').autosize();
  },

  componentDidUpdate: function(){
    $("#editorMarkdown").trigger('autosize.resize');
  }

});


var FileSelector = React.createClass({

  handleChange: function(event){
    var selectedFile = event.target.value;
    if (selectedFile === 'new'){
      this.props.createFile();
    } else {
      this.props.loadFile(selectedFile);
    }
  },

  render: function(){
    // $("title").text("Editor: " + this.props.fileIdsWithNames[ parseInt(this.props.selectedFile) ].name);    
    return (<div id='fileSelector'>
              <span>File:</span>
              <select value={this.props.selectedFile} onChange={this.handleChange}>
                {this.props.fileIdsWithNames.map(function(idWithName){
                  return <option value={idWithName.id}>{idWithName.name}</option>;
                })}                
                <option value="new">New file</option>
              </select>
              {this.props.selectedFile != 0 ? 
               [<button onClick={this.props.renameFile}>rename</button>,
                <button onClick={this.props.deleteFile}>delete</button>] : 
               []}
           </div>);
  }

});


var WebpplEditor = React.createClass({

  getInitialState: function(){
    var localState = localStorage.getItem("WebPPLEditorState");
    if (localState === null){
      // block ids are separate from ordering indices (and only happen to coincide here)
      return {
        selectedFile: 0,
        markdownOutputOpen: false,
        files: {
          0 : {
            name: 'Default',
            blocks: {
              1: {type: "text", content: "*Click here* to edit me!", orderingKey: 1},
              2: {type: "code", content: 'print("hello world!")', orderingKey: 2}
            }
          }
        }        
      };
    } else {
      var parsedState = JSON.parse(localState);
      if (parsedState.blocks){
        // deprecated single-file version of LocalStorage - convert to
        // multi-file version
        return {
          selectedFile: 0,
          markdownOutputOpen: false,
          files: {
            0 : {
              name: 'Default',
              blocks: parsedState.blocks
            }
          }        
        };
      }
      parsedState.markdownOutputOpen = false;
      return parsedState;
    }
  },  

  componentDidUpdate: function(prevProps, prevState) {
    localStorage.WebPPLEditorState = JSON.stringify(this.state);
    // FIXME: with many files, this will get very slow?
  },


  // File handling
  
  nextFileId: function(){
    return nextIntegerKey(this.state.files);
  },

  loadFile: function(file){
    if (file in this.state.files){
      this.setState({
        selectedFile: file
      });
    }
  },

  renameFile: function(){
    if (this.state.selectedFile == 0){
      alert('Cannot rename default file!');
    } else {
      var currentName = this.state.files[this.state.selectedFile].name
      var newName = window.prompt("Rename '" + currentName + "' to?", "");
      if (newName){
        var newFiles = _.clone(this.state.files);
        newFiles[this.state.selectedFile] = _.clone(this.state.files[this.state.selectedFile]);
        newFiles[this.state.selectedFile].name = newName;
        this.setState({
          files: newFiles
        });
      }
    }
  },

  deleteFile: function(){
    if (this.state.selectedFile == 0){
      alert('Cannot delete default file!');
    } else {
      var newFiles = _.clone(this.state.files);
      delete newFiles[this.state.selectedFile];
      this.setState({
        files: newFiles,
        selectedFile: 0
      });
    }
  },

  createFile: function(){
    // pop up alert box, ask for filename
    var newFileId = this.nextFileId();
    var newFileName = window.prompt("New file name?", "");
    // check that files doesn't exist already
    if (!newFileName || (newFileName.trim() === '')){
      alert('Filename empty!');
      return;
    }
    if (newFileName in _.keys(this.state.files)){
      alert('File ' + newFileName + ' already exists!');
      return;
    }
    // create empty file in state
    // and set new filename as current filename
    newFiles = _.clone(this.state.files);
    newFiles[newFileId] = { name: newFileName, blocks: {} };
    this.setState({
      selectedFile: newFileId,
      files: newFiles
    });
  },


  // Block handling

  updateBlocks: function(blocks){
    var newFiles = _.clone(this.state.files);
    newFiles[this.state.selectedFile] = _.clone(this.state.files[this.state.selectedFile]);
    newFiles[this.state.selectedFile].blocks = blocks
    this.setState({
      files: newFiles
    });
  },
  
  currentBlocks: function(){
    return this.state.files[this.state.selectedFile].blocks;
  },
  
  nextBlockId: function(){
    return nextIntegerKey(this.currentBlocks());
  },

  nextOrderingKey: function(){
    var keys = _.values(this.currentBlocks()).map(function(block){return block.orderingKey;});
    if (keys.length) {
      return _.max(keys) + 1;
    } else {
      return 0;
    }
  },

  addBlock: function(type, content){
    var newBlocks = _.clone(this.currentBlocks());
    var newBlock = {
      type: type,
      content: content,
      orderingKey: this.nextOrderingKey()
    };
    newBlocks[this.nextBlockId()] = newBlock;
    this.updateBlocks(newBlocks);
  },

  addCodeBlock: function(){
    this.addBlock("code", "");
  },

  addTextBlock: function(){
    this.addBlock("text", "*Click here* to edit me!");
  },

  updateBlockContent: function(blockId, content){
    var newBlocks = _.clone(this.currentBlocks());
    var updatedBlock = _.clone(this.currentBlocks()[blockId]);
    updatedBlock.content = content;
    newBlocks[blockId] = updatedBlock;
    this.updateBlocks(newBlocks);
  },

  removeBlock: function(blockId){
    var newBlocks = _.clone(this.currentBlocks());
    delete newBlocks[blockId];
    this.updateBlocks(newBlocks);
  },

  moveBlock: function(blockId, direction){
    // Get ordered list of blocks (with ids)
    var orderedBlockList = getOrderedBlockList(this.currentBlocks());

    // Figure out where blockId is in that list
    var i = _.indexOf(orderedBlockList, function(block){return block.id == blockId;});

    // Swap orderingKey with node before/after
    if (direction == "up"){
      if (i > 0) {
        var tmp = orderedBlockList[i - 1].orderingKey;
        orderedBlockList[i - 1].orderingKey = orderedBlockList[i].orderingKey;
        orderedBlockList[i].orderingKey = tmp;
      }
    } else if (direction == "down") {
      if (i < (orderedBlockList.length - 1)) {
        var tmp = orderedBlockList[i + 1].orderingKey;
        orderedBlockList[i + 1].orderingKey = orderedBlockList[i].orderingKey;
        orderedBlockList[i].orderingKey = tmp;
      }
    } else {
      console.error("Unknown direction", direction);
    }

    // Create new blocks, and set state
    var newBlocks = {};
    orderedBlockList.map(function(block){
      var id = block.id;
      delete block.id;
      newBlocks[id] = block;
    });

    this.updateBlocks(newBlocks);
  },

  toggleMarkdownOutput: function(){
    var newMarkdownOutputOpen = !this.state.markdownOutputOpen;
    this.setState({markdownOutputOpen: newMarkdownOutputOpen});
    if (newMarkdownOutputOpen){
      setTimeout(function(){$('#editorMarkdown').autosize();}, 500);
    }
  },

  render: function() {
    var that = this;
    var fileIdsWithNames = [];
    _.pairs(this.state.files).forEach(function(filePair){
      fileIdsWithNames.push({
        id: filePair[0],
        name: filePair[1].name
      });
    });
    var orderedBlocks = getOrderedBlockList(this.currentBlocks());
    var renderedBlocks = [];
    orderedBlocks.map(function(block){
      if (block.type === "text") {
        var renderedBlock = (<MarkdownInputBox initialText={block.content}
                                               updateText={that.updateBlockContent.bind(that, block.id)}
                                               removeMe={that.removeBlock.bind(that, block.id)}
                                               moveUp={that.moveBlock.bind(that, block.id, "up")}
                                               moveDown={that.moveBlock.bind(that, block.id, "down")}
                                               key={that.state.selectedFile + '-' + block.id} />);
      } else if (block.type === "code") {
        var renderedBlock = (<CodeInputBox initialCode={block.content}
                                           updateCode={that.updateBlockContent.bind(that, block.id)}
                                           removeMe={that.removeBlock.bind(that, block.id)}
                                           moveUp={that.moveBlock.bind(that, block.id, "up")}
                                           moveDown={that.moveBlock.bind(that, block.id, "down")}
                                           key={that.state.selectedFile + '-' + block.id} />);
      } else {
        console.error("Unknown block type: ", block.type);
      }
      renderedBlocks.push(renderedBlock);
    });
    return (<div>
        <div id="editorBlocks">
          {renderedBlocks}
        </div>
        <div id="editorControls">
          <FileSelector fileIdsWithNames={fileIdsWithNames} 
                        selectedFile={this.state.selectedFile}
                        loadFile={this.loadFile} 
                        createFile={this.createFile} 
                        deleteFile={this.deleteFile} 
                        renameFile={this.renameFile} />
          <button className="btn btn-default" onClick={this.addCodeBlock}>add code</button>
          <button className="btn btn-default hidden-xs" onClick={this.addTextBlock}>add text</button>
          <button className="btn btn-default hidden-xs" onClick={this.toggleMarkdownOutput}>.md</button>
        </div>
        <MarkdownOutputBox blocks={this.currentBlocks()} open={this.state.markdownOutputOpen}/>
      </div>);
  }
});

var editorContainer = document.getElementById('reactEditor');

if (editorContainer){
  React.renderComponent(<WebpplEditor/>, editorContainer);
}
