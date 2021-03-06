/*
  This library permit to make a restricted document from an HTML element (the
  most time the <body> tag). This is useful when an application wants to manage
  an HTML frame without making security issues (like window.top).
  The most part of DOM features are implemented here.

  Revision 2
*/

'use strict';

// NOTE: Elements are unable to access to the parent of their document.
//       doc.tree.parentElement or doc.tree.children[0].parentElement.parentElement will return the 'null' value
// NOTE: The 3rd party code can access to VElement or SVDocument :
//       element.constructor, doc.constructor... but CANNOT modify them

/**
 * SVDom Error class
 * @class
 * @param {Object.<string, any>}
 */
// This particular syntax is needed to make the class a constant
const SVDError = (function () {
  /**
   * Ace Error class
   * @class
   */
  class SVDError extends Error {
    /**
     * The class' constructor
     * @constructor
     * @param {string} message The error message
     * @returns {AceError}
     */
    constructor(message) {
      // Run the native Error class' constructor
      // This function also defines the `this` constant
      super();
      // Set the error's name...
      this.name = 'SVDError';
      // ...and its message
      this.message = message;
    }
  }

  // Return the class
  return SVDError;
})();

/**
  * VElement class
  * @constructor
  * @param {Element} element HTML DOM element
  * @param {Element} main The main DOM element
  */
const VElement = function(element, main) {
  /**
    * Make an elements collection
    * @param {array} collection
    * @param {Element} main The main DOM tree
    * @returns {array}
    */
  function makeCollection(collection, main) {
    let out = [];

    for(let item of collection)
      out.push(new VElement(item, main));

    return out;
  }

  // Check arguments
  if(!(element instanceof Element) || !(main instanceof Element))
    throw new Error('Illegal arguments for VElement : Requires two DOM elements');

  // Define setters for special attributes
  this.__defineSetter__('className', name => element.className = name);
  this.__defineSetter__('id', id => element.id = id);
  this.__defineSetter__('innerHTML', content => element.innerHTML = SVDocument.safe(content));
  this.__defineSetter__('innerNTML', content => element.innerHTML = SVDocument.parse(content, true));
  this.__defineSetter__('innerText', content => element.innerText = content);

  // Define getters for simple attributes
  this.__defineGetter__("accessKey", () => element.accessKey);
  this.__defineGetter__("childElementCount", () => element.childElementCount);
  this.__defineGetter__("className", () => element.className);
  this.__defineGetter__("clientHeight", () => element.clientHeight);
  this.__defineGetter__("clientLeft", () => element.clientLeft);
  this.__defineGetter__("clientTop", () => element.clientTop);
  this.__defineGetter__("clientWidth", () => element.clientWidth);
  this.__defineGetter__("contentEditable", () => element.contentEditable);
  this.__defineGetter__("dir", () => element.dir);
  this.__defineGetter__("id", () => element.id);
  this.__defineGetter__("innerHTML", () => element.innerHTML);
  this.__defineGetter__("innerText", () => element.innerText);
  this.__defineGetter__("isContentEditable", () => element.isContentEditable);
  this.__defineGetter__("lang", () => element.lang);
  this.__defineGetter__("namespaceURI", () => element.namespaceURI);
  this.__defineGetter__("nodeName", () => element.nodeName);
  this.__defineGetter__("nodeType", () => element.nodeType);
  this.__defineGetter__("nodeValue", () => element.nodeValue);
  this.__defineGetter__("offsetHeight", () => element.offsetHeight);
  this.__defineGetter__("offsetWidth", () => element.offsetWidth);
  this.__defineGetter__("offsetLeft", () => element.offsetLeft);
  this.__defineGetter__("offsetTop", () => element.offsetTop);
  this.__defineGetter__("scrollHeight", () => element.scrollHeight);
  this.__defineGetter__("scrollLeft", () => element.scrollLeft);
  this.__defineGetter__("scrollTop", () => element.scrollTop);
  this.__defineGetter__("scrollWidth", () => element.scrollWidth);
  this.__defineGetter__("tabIndex", () => element.tabIndex);
  this.__defineGetter__("tagName", () => element.tagName);
  this.__defineGetter__("textContent", () => element.textContent);
  this.__defineGetter__("title", () => element.title);

  // Define getters for attributes that returns an element
  this.__defineGetter__("firstChild", () => element.firstChild ? new VElement(element.firstChild, main) : element.firstChild);
  this.__defineGetter__("firstElementChild", () => element.firstElementChild ? new VElement(element.firstElementChild, main) : element.firstElementChild);
  this.__defineGetter__("firstChild", () => element.firstChild ? new VElement(element.firstChild, main) : element.firstChild);
  this.__defineGetter__("lastElementChild", () => element.lastElementChild ? new VElement(element.lastElementChild, main) : element.lastElementChild);
  this.__defineGetter__("nextSibling", () => element.nextSibling ? new VElement(element.nextSibling, main) : element.nextSibling);
  this.__defineGetter__("nextElementSibling", () => element.nextElementSibling ? new VElement(element.nextElementSibling, main) : element.nextElementSibling);
  this.__defineGetter__("offsetParent", () => element.offsetParent ? new VElement(element.offsetParent, main) : element.offsetParent);
  this.__defineGetter__("parentElement", () => (element === main) ? null : (element.parentElement ? new VElement(element.parentElement, main) : element.parentElement));
  this.__defineGetter__("previousSibling", () => element.previousSibling ? new VElement(element.previousSibling, main) : element.previousSibling);
  this.__defineGetter__("previousElementSibling", () => element.previousElementSibling ? new VElement(element.previousElementSibling, main) : element.previousElementSibling);

  /**
    * Add an event listener to the element
    * @param {string} name The event's name (e.g. "click" "mousemove")
    * @param {function} callback
    * @returns {boolean}
    */
  this.addEventListener = (name, callback) => {
    // Check the arguments type
    if(typeof name !== 'string' || typeof callback !== 'function')
      return false;

    // Add the event listener
    element.addEventListener(name, () => {
      // Here, the callback is not runned in another scope
      // TODO: Grant access to the event data
      callback();
    });

    // Success !
    return true;
  };

  /**
    * Append an element as a children of this element
    * @param {Element|VElement} child
    * @returns {void|SVDError}
    */
  this.appendChild = (child) => {
    if(child instanceof Element) {
      if(child.outerHTML !== SVDocument.safe(child.outerHTML))
        return new SVDError('Element safety mismatch : Can\'t append an unsafe element to a safe element');

      element.appendChild(child);
    } else if(child instanceof VElement)
      child.appendTo(this);
    else
      return new SVDError('Unknown element type, can\'t append it');
  };

  /**
    * Append this element as a child of a parent
    * @param {VElement|Element} parent
    * @returns {void|SVDError}
    */
  this.appendTo = (parent) => {
    if(parent instanceof Element)
      //parent.appendChild(element);
      (new VElement(parent, main)).appendChild(element, main);
    else if(parent instanceof VElement)
      parent.appendChild(element);
    else
      return new SVDError('Unknown element type, can\'t append this element to it');
  };

  /**
    * Emit: blur
    * @returns {void}
    */
  this.blur = () => { element.blur(); return ; };

  /**
    * Emit: click
    * @returns {void}
    */
  this.click = () => { element.click(); return ; };

  /**
    * Clone the element
    * @returns {VElement}
    */
  this.cloneNode = () => new VElement(element.cloneNode(), main);

  /**
    * Compare the position into the document
    * @param {VElement} el
    * @returns {boolean}
    */
  this.compareDocumentPosition = el => el.documentPositionComparedTo(element);

  /**
    * Compare the position into the document
    * @param {VElement|Element} el
    * @returns {boolean}
    */
  this.documentPositionComparedTo = (el) => {
    if(el instanceof Element)
      return el.compareDocumentPosition(element);
    else if(el instanceof VElement)
      return el.compareDocumentPosition(this);
  };

  /**
    * Check if the element contains another
    * @param {VElement} el
    * @returns {boolean}
    */
  this.contains = (el) => el.isContained(element);

  /**
    * Check if the element is contained into another
    * @param {VElement|Element} el
    * @returns {boolean}
    */
  this.isContained = (el) => {
    if(el instanceof Element)
      return el.contains(element);
    else if(el instanceof VElement)
      return el.contains(this);
  };

  /**
    * Emit: focus
    * @returns {void}
    */
  this.focus = () => { element.focus(); return ; };

  /**
    * Get an element's attribute
    * @param {string} attr Attribute
    * @returns {number|string|void} Attribute's value
    */
  this.getAttribute = (attr) => element.getAttribute(attr);

  // NOTE: Ignored 'getAttributeNode()'

  /**
    * Get an elements collection by class name
    * @param {string} name
    * @returns {JCollection}
    */
  this.getElementsByClassName = name => makeCollection(element.getElementsByClassName(name), main);

  /**
    * Get an elements collection by tag name
    * @param {string} tag
    * @returns {JCollection}
    */
  this.getElementsByTagName = name => makeCollection(element.getElementsByTagName(name), main);

  /**
    * Check if the element has a given attribute
    * @param {string} name
    * @returns {boolean}
    */
  this.hasAttribute = name => element.hasAttribute(name);

  /**
    * Check if the element has any attributes
    * @returns {boolean}
    */
  this.hasAttributes = () => element.hasAttributes();

  /**
    * Check if the element has any child nodes
    * @returns {boolean}
    */
  this.hasChildNodes = () => element.hasChildNodes();

  /**
    * Insert an element before another
    * @param {VElement} el1
    * @param {VElement} el2
    * @returns {void}
    */
  this.insertBefore = (el1, el2) => {
    el1.__insertBeforeS(element, el2);
  };

  /**
    * First callback for @insertBefore
    * @param {Element} parent The future parent of the both children
    * @param {VElement} after This element must be insert before this one
    * @returns {void}
    */
  this.__insertBeforeS = (parent, after) => {
    after.__insertBefore(parent, element);
  };

  /**
    * Second callback for @insertBefore
    * @param {Element} parent
    * @param {Element} before Element to insert before this one
    * @returns {void}
    */
  this.__insertBefore = (parent, before) => {
    parent.insertBefore(before, element);
  };

  /**
    * Check if a given namespace is the element's default one
    * @param {string} namespaceURI
    * @returns {boolean}
    */
  this.isDefaultNamespace = namespaceURI => element.isDefaultNamespace(namespaceURI);

  /**
    * Check if two nodes are equals
    * @param {VElement|Element} el
    * @returns {boolean}
    */
  this.isEqualNode = (el) => {
    if(el instanceof Element)
      return element.isEqualNode(el);
    else if(el instanceof VElement)
      return el.isEqualNode(element);
  };

  /**
    * Check if two nodes are the same
    * @param {VElement|Element} el
    * @returns {boolean}
    */
  this.isSameNode = this.is = (el) => {
    if(el instanceof Element)
      return element.isSameNode(el);
    else if(el instanceof VElement)
      return el.isSameNode(element);
  };

  /**
    * Check if the element supports a given feature
    * @param {string} name
    * @returns {boolean}
    */
  this.isSupported = name => element.isSupported(name);

  /**
    * W3C: Joins adjacent text nodes and removes empty text nodes in the element
    * @returns {void}
    */
  this.normalize = () => { element.normalize(); return ; };

  /**
    * Get the first child that matches with the selector
    * @param {string} selector
    * @returns {VElement|void}
    */
  this.querySelector = (selector) => {
    let found = element.querySelector(selector);
    return found ? new VElement(found, main) : null;
  };

  /**
    * Get all children that matches with the selector
    * @param {string} selector
    * @returns {JCollection}
    */
  this.querySelectorAll = selector => makeCollection(element.querySelectorAll(selector), main);

  /**
    * Remove an attribute from the element
    * @param {string} name
    * @returns {void}
    */
  this.removeAttribute = name => { element.removeAttribute(name); return ; };

  // NOTE: Ignored 'removeAttributeNode'

  /**
    * Remove a child from the element
    * @param {VElement|Element} child
    * @returns {void}
    */
  this.removeChild = (child) => {
    if(child instanceof Element)
      element.removeChild(child);
    else if(child instanceof VElement)
      child.removeFrom(element);
  };

  /**
    * Remove the element from a parent
    * @param {VElement|Element} parent
    * @returns {void}
    */
  this.removeFrom = (parent) => {
    if(parent instanceof Element)
      parent.removeChild(element);
    else if(parent instanceof VElement)
      parent.removeChild(element);
  };

  // NOTE: Ignored 'setAttributeNode'

  /**
    * Remove an event listener
    * @param {string} eventName
    * @param {function} callback
    * @param {boolean} [useCapture] W3C: The event phase to remove the event handler from
    * @returns {void}
    */
  this.removeEventListener = (eventName, callback, useCapture) => { element.removeEventListener(eventName, callback, useCapture); return ; };

  // NOTE: Ignored 'item'

  /**
    * Set an element's attribute
    * @param {string} attr Attribute
    * @param {string} value Value
    * @returns {void}
    */
  this.setAttribute = (attr, value) => {
    // If the document is in safe mode and the attribute is forbidden (like 'onclick' 'onmousemove' and all DOM events)
    if(SVDocument.DOMEvents.includes(attr.substr(2)))
      // Make an error
      return new SVDError('Can\'t set attribute "${attr}" because document is in safe mode', {attr});

    // Else, set the attribute
    element.setAttribute(attr, value);
  };

  /**
    * Remove the element
    * @returns {void}
    */
  this.remove = () => { element.remove(); };

  /**
    * Get the element's CSS rules
    */
  this.__defineGetter__('style', () => element.style);

  /**
    * Get the element's children
    */
  this.__defineGetter__('children', () => makeCollection(element.children, main));

  // Functions that

  // NOTE: Ignored getters for 'attributes' 'childNodes' 'classList' 'ownerDocument' 'parentNode' 'length'

  // Freeze this object to make malicious applications unable to modify functions and get the DOM main tree
  Object.freeze(this);
};

/**
  * SVDocument class
  * @constructor
  * @param {string} [content] NTML or HTML content
  * @param {boolean} [dontMark] Don't mark this div with attributes to recognize a SVDocument. Default: false
  */
let SVDocument = function(content = '', dontMark = false) {
  // This is the main DOM tree, which will contains all of the other elements
  let top = document.createElement('iframe');
  // Remove any border from the <iframe>
  top.style.border = 'none';
  // Create a <body> tag, which will be the main tree of this document
  let dom = document.createElement('body');
  // Is the document already in a container?
  let isContained = false;

  // If the document can be marked to recognize it's a J Document
  if(!dontMark)
    top.setAttribute('svdom-role', 'document');

  /**
    * Get the main DOM tree as a J Element
    * @type {VElement}
    */
  this.tree = this.body = new VElement(dom, dom); // Make a VElement and disable the 'parentElement' property

  /**
    * Append the document to a DOM Element
    * @param {Element} The DOM Element
    */
  this.appendTo = (element) => {
    if (isContained)
      return new VError('Document is already contained in another HTML element');

    element.appendChild(top);
    top.contentDocument.querySelector('html').replaceChild(dom, top.contentDocument.querySelector('body'));
    // Remove margin from the <body> tag
    dom.style.margin = '0px';
    isContained = true;
  };

  /**
    * Create an element from a tag name
    * @param {string} tagName The element's tag name (like 'span' or 'div')
    * @returns {VElement}
    */
  this.createElement = (tagName) => {
    return !SVDocument.UnsafeTags.includes(tagName) ? new VElement(document.createElement(tagName), dom) : false;
  };

  // Define aliases for .querySelector() and .querySelectorAll()
  this.querySelector = (selector) => this.tree.querySelector(selector);
  this.querySelectorAll = (selector) => this.tree.querySelectorAll(selector);

  // Freeze this object to make malicious applications unable to modify functions and get the DOM main tree
  Object.freeze(this);
};

/**
  * Make a content safe
  * @param {string} content
  * @returns {string}
  */
SVDocument.safe = (content) => {
  // Create a DOM Element
  let tmp = document.createElement('div'), i, j;
  // Set the HTML content as his content
  tmp.innerHTML = content;

  // Remove all dangerous elements, like `script` or `iframe`, specified in SVDocument.UnsafeTags
  let collection = tmp.querySelectorAll(SVDocument.UnsafeTags.join(','));
  for(i = 0; i < collection.length; i += 1)
    collection[i].remove();

  // Remove all JS event attributes, like 'onclick' or 'onmouseover', specified in SVDocument.DOMEvents
  collection = tmp.querySelectorAll('[on' + SVDocument.DOMEvents.join('],[on') + ']');

  for(element of collection)
    for(event of SVDocument.DOMEvents)
      element.removeAttribute('on' + event);

  return tmp.innerHTML;
};

/**
  * Parse a NTML content to make HTML. NOTE : This works with HTML, but that's useless.
  * @param {string} content NTML content
  * @param {boolean} [safe] Returns a safe HTML content
  * @returns {string} HTML content
  */
SVDocument.parse = (content, safe = false) => {
  if(!content)
    return '';

  // Perform some *little* regex :)
  content = content
    // `<div: class:"test">` => `<div class="test"></div>`
    .replace(/<([a-zA-Z0-9_]+):( *)([^<>]+)>/g, (match, tag, spaces, attributes) => {
      if(attributes.trim().endsWith('/') || (!spaces.length && attributes.length))
        return match;
      else
        return '<' + tag + ' ' + attributes + '></' + tag + '>';
    })
    // `<div :output>` => '<div id="output">'
    .replace(/<([a-zA-Z0-9_]+)( +):([a-zA-Z0-9_]+)( *)([^<>]*)>/g, (match, tag, spaces1, id, spaces2, rest) => {
      if(!spaces2.length && rest.length)
        return match;

      return '<' + tag + ' id="' + id + '" ' + rest + '>';
    })
    // `<div:"Some content">` => `<div>Some content</div>`
    .replace(/<([a-zA-Z0-9_]+):"([^"]+)"( *)([^<>]*)>/g, (match, tag, content, spaces, rest) => {
      if(rest.trim().endsWith('/'))
        return match;

      return '<' + tag + (rest ? ' ' + rest : '') + '>' + content + '</' + tag + '>';
    });
    // `<div class:"name" data:"error">` => `<div class="name" data="error">`
  let nfi = true;
  while(nfi) {
    nfi = false;
    content = content
      .replace(/<([^<>]+):([^<>]+)>/g, (match, before, after) => {
        if(((before.split('"').length - 1) / 2) % 1)
          return match;

        nfi = true;
        return '<' + before + '=' + after + '>';
      });
  }

  return (safe ? SVDocument.safe(content) : content);
};

// DOMEvents : HTML attributes to call a JavaScript function when there are some events
// UnsafeTags: Unsafe tags which can permit to run, with any way, JavaScript code directly into the web page
SVDocument.DOMEvents  = ["click", "contextmenu", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "keydown", "keypress", "keyup", "abort", "beforeunload", "error", "hashchange", "load", "pageshow", "pagehide", "resize", "scroll", "unload", "blur", "change", "focus", "focusin", "focusout", "input", "invalid", "reset", "search", "select", "submit", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "copy", "cut", "paste", "afterprint", "beforeprint", "abort", "canplay", "canplaythrough", "durationchange", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "error", "message", "open", "online", "offline", "show", "toggle", "wheel"];
SVDocument.UnsafeTags = ["frame", "iframe", "webkit", "script", "style", "meta", "link", "webview", "object"];

// Freeze these arrays to make malicious applications unable to modify it
Object.freeze(SVDocument.CSSNumber);
Object.freeze(SVDocument.DOMEvents);
Object.freeze(SVDocument.UnsafeTags);
