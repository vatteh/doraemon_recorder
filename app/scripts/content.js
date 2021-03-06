'use strict';

/**
 * captureInput() grabs all input tags on the page and adds an
 * event listener to them. When Tab or Enter is pressed, the element
 * is passed to the handler() function.
 */
function captureTextFieldInput() {
	var elements = document.getElementsByTagName('input');
  for (var i = 0; i < elements.length; i++) {
		elements[i].addEventListener('keydown', function(event) {
  		if (event.keyCode === 9 || event.keyCode === 13) 
  			handler(4, 'Enter text', event.target);
		});
  }
};

/**
 * handler() passes the test step to the background.js
 */
 // Test Step object
 // { 
 //  stepCode: 
 //  eventText: 
 //  path: (optional)
 //  value: (optional)
 // }
function handler(stepCode, eventText, node){
  var path = cssPath(node);
  var message = {stepCode: stepCode, eventText: eventText, path: path};
  if (node.value) {
  	message.value = node.value;
  }
  
  chrome.runtime.sendMessage({action:'recordTestStepContent', value: message});
};

/**
 * cssPath() retruns the edited path to the targeted element
 * (pasted from stackOverflow http://stackoverflow.com/questions/3620116/get-css-path-from-dom-element)
 *
 * Can also use event.path
 */
function cssPath(el) {
  if (!(el instanceof Element)) 
      return;
  var path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
      var selector = el.nodeName.toLowerCase();
      if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
      } else {
          var sib = el, nth = 1;
          while (sib = sib.previousElementSibling) {
              if (sib.nodeName.toLowerCase() == selector)
                 nth++;
          }
          if (nth != 1)
              selector += ":nth-of-type("+nth+")";
      }
      path.unshift(selector);
      el = el.parentNode;
  }
  return path;
}

window.onclick = function(event) { 
    handler(3,'Click', event.target);
};

captureTextFieldInput();