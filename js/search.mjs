import reorder from "./reorder.mjs";

// create slot for logo
const slot = document.createElement( "slot" );


// link stylesheet for search box
const stylesheet = document.createElement( "link" );
stylesheet.href = "css/search.css";
stylesheet.rel = "stylesheet";
stylesheet.type = "text/css";


// preload hover image for search icon
const preload = document.createElement( "link" );
preload.href = "images/search-icon-glow.svg";
preload.rel = "preload";
preload.as = "image";


// create form element
const form = document.createElement( "form" );

// create search input textbox
const searchBox = document.createElement( "input" );
searchBox.type = "text";
searchBox.placeholder = "Search for keywords...";

// create submit button
const submitButton = document.createElement( "button" );
submitButton.type = "submit";

// attach inputs to form
[ searchBox, submitButton ].forEach( element => form.appendChild( element ) );

// get list for reordering
const list = document.querySelector( "#searchList" );

// attach event to form for searching
form.onsubmit = ( event ) => {
  const TIMESTAMP = Date.now();
  void event.preventDefault();
  void event.stopPropagation();
  void reorder( searchBox.value, list.querySelectorAll( searchBox.value[0] === "+" ?  "ul" : searchBox.value[0] === "@" ? "h4" : ":scope > *" ) )
    .map( key => list.children[key] ).forEach( child => list.appendChild( child ) );
  console.debug( `searched for '${searchBox.value}' in ${Date.now() - TIMESTAMP}ms` );
  window.scrollTo( 0, 0 );
};

// attach closed shadowRoot to header
const shadowRoot = document.querySelector( "header" ).attachShadow({ mode: "closed" });

// attach elements to shadowRoot
[ slot, stylesheet, preload, form ].forEach( element => shadowRoot.appendChild( element ) );


// attach events to tags for searching
document.querySelectorAll( "#searchList ul > li" ).forEach( li => {
  li.onclick = ( event ) => {
    void event.preventDefault();
    void event.stopPropagation();
    searchBox.value = `+${li.innerText}`;
    void submitButton.click();
  }
});


// create CSS hover rule for tags
const cssRules = [ ...document.styleSheets ].find( styleSheet => /tilecards\.css$/.test( styleSheet.href ) );
cssRules.insertRule( ".tilecards ul > li:hover { background-color: #FFCC0040; }", cssRules.length );
