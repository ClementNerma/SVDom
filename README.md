# SVDom

**SVDom** is a tiny library that allows you to inject HTML snippets in your web applications and permit unsecured code to play with.
In an Electron or NW.js application, you can run untrusted JavaScript code into a VM, create in the main thread a `SVDocument` object and give it to the untrusted code. It will play safely with it, without possibly overflowing the limits imposed by the SVDom library.

## How does it work ?

When you create a web page, include the SVDom library :

```html
<!-- Load SVDom -->
<script type="text/javascript" src="svdom.js"></script>
```

Then, you can create a document and manipulate it without caring of the content you put into :

```javascript
// Create a new document
const doc = new SVDocument();
// Inject a malicious code
doc.body.innerHTML = '<script type="text/javascript">alert("Malicious code worked!");</script>'; // Does nothing
// Create a script element
doc.createElement('script'); // FALSE
```

## Security prevention

The library allows you to manipulate a Secured Virtual DOM (SVDom), so it permit to inject any HTML content from any source without caring about security issues.  
SVDom prevent execution of all scripts, remove JavaScript event listeners, and a few list of HTML tags (frame, iframe, webkit, meta, webview, object...).  

## Manipulating the DOM

When you create an element with `let element = doc.createElement("span")` for example, you can use the most functions you usually use on an HTMLElement object, like `element.innerHTML = "something <strong>strange</strong>";`, `element.style.border = "1px solid black";` or even `element.parentElement.children[1].remove();` !

Elements will *NOT* be able to access to the parent of the whole `doc` object, so it can only put malicious code in the
Unsecured scripts you could run in your web application (with a VM for example) can use this object as long as it needs to, because no malicious script can overflow the restriction of SVDom.

## Graphical overflowing

A typical problem is the graphical overflow. Because all elements have a 'style' property which allow them to change their appereance and position on the page, it could be possible to turn them into malicious banners for example.
To prevent that problem, the Virtual DOM is constitued of an `iframe` element, and it's that element you put in your web application's DOM. All elements manipulated thanks to the `doc` object are in this iframe, and malicious applications can't escape from this. So you can run safely untrusted code (as long as you do it in a VM, like in Electron) without caring about security issues due to graphical overflowing.

## Demo

You can check the `test/index.html` file in the repository to see SVDom in action (you can see it online at [this adress](https://clementnerma.github.io/SVDom/test/index.html)).

# License

This project is released under the [Creative Commons Attribution BY-NC-ND 4.0 International](https://creativecommons.org/licenses/by-nc-nd/4.0/) license.
The license of the project may change on the future and it will maybe release using the GPL license in a future version.

# Disclaimer

The software is provided "as is" and the author disclaims all warranties
with regard to this software including all implied warranties of
merchantability and fitness. In no event shall the author be liable for
any special, direct, indirect, or consequential damages or any damages
whatsoever resulting from loss of use, data or profits, whether in an action
of contract, negligence or other tortious action, arising out of or in
connection with the use or performance of this software.
