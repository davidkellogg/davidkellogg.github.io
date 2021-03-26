"use strict";

let PAGEURL = new URL( window.location.href );
const observedElements = document.querySelector("search-bot");
const pageVariables = {};

for ( const [ key, value ] of PAGEURL.searchParams ) {
  pageVariables[ key ] = value;
  console.log( pageVariables );
  observedElements.setAttribute( key, value )
  console.log( observedElements );
}

new MutationObserver( ( mutationList ) => {
  mutationList.forEach( ( mutation ) => {
    pageVariables[mutation.attributeName] = mutation.target.getAttribute( mutation.attributeName );

    for ( const param in pageVariables ) {
      PAGEURL.searchParams.set( param, pageVariables[param] );
    }

    window.history.replaceState( null, null, PAGEURL );
  });
}).observe( observedElements, {
  attributes: true,
  attributeFilter: [ "search" ]
});
