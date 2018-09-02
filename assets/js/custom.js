"use strict";

// Date

function setDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  $(".date").text(yyyy+'-'+mm+'-'+dd);
}

$(setDate);

// Bibtex

function setBibtex(){
  $('#toggle-bibtex').click(function(){$('#bibtex').toggle(); return false;});
}

$(setBibtex)

// Special functions for webppl code boxes

var invertMap = function (store, k, a, obj) {

  var newObj = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var value = obj[prop];
      if (newObj.hasOwnProperty(value)) {
        newObj[value].push(prop);
      } else {
        newObj[value] = [prop];
      }
    }
  }

  return k(store, newObj);
};


// Code Boxes
var EditorModel = require('./editor').EditorModel;

$(document).ready(function() {
  $("pre:not(.norun)").map(
	  function(index, item) {

      var defaultEngine = $(item).attr("data-engine") || 'webchurch';
      var defaultCode = $(item).text();

      var edOptions = {
        code: defaultCode,
        engine: defaultEngine
      };

      var ed = new EditorModel(edOptions);

      // replace <pre> with editor
      ed.replaceDomEl(item);

      // after running, replace svg element with img element
      // containing the svg as a data uri so that users can
      // right click charts and download them
      ed.on('run.finish', function() {
        setTimeout(function() {
          var $svgs = $(ed.display.$results).find("svg");

          var svgTemplate = _.template(
            '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg class="marks" width="<%- width %>" height="<%- height %>" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style type="text/css"></style></defs>');


          $svgs.map(function(i, svg) {
            var svgText = svg.innerHTML;
            var svgHeader = svgTemplate({width: $(svg).width(),
                                         height: $(svg).height()})

            $(svg).replaceWith(
              $("<img>").attr({src: 'data:image/svg+xml;utf8,' +
                               svgHeader +
                               svgText + '</svg>'

                              }))
          });

        }, 0)
      })

	    ed.on('reset', function() {
        $(ed.display.wrapper).find(".code-settings > span ").remove();
	      var initialOptions = ed.get('initialOptions'),
		    exerciseName = ed.get('exerciseName');
      })
    });
});


//LATEX
$(document).ready(function() {
    
    $("script[type='math/tex']").replaceWith(
	function(){
      var tex = $(this).text();
      console.log("HERE");
      return "<span class=\"inline-equation\">" +
          katex.renderToString(tex) +
          "</span>";
  });
    
});

$(document).ready(function() {
    $("script[type='math/tex; mode=display']").replaceWith(
	function(){
	    var tex = $(this).text();
	    return "<div class=\"equation\">" +
		katex.renderToString("\\displaystyle "+tex) +
		"</div>";
	});
});
