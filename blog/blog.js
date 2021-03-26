"use strict";

let PAGEURL = new URL( window.location.href );
const pageVariables = {};

for ( const [ key, value ] of PAGEURL.searchParams ) {
  pageVariables[ key ] = value;
}

new MutationObserver( ( mutationList ) => {
  mutationList.forEach( ( mutation ) => {
    pageVariables[mutation.attributeName] = mutation.target.getAttribute( mutation.attributeName );

    for ( const param in pageVariables ) {
      PAGEURL.searchParams.set( param, pageVariables[param] );
    }

    window.history.replaceState( null, null, PAGEURL );
  });
}).observe( document.querySelector("search-bot"), {
  attributes: true,
  attributeFilter: [ "search" ]
});
