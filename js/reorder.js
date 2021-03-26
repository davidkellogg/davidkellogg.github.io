"use strict";
import sanitize from "./sanitize.js";

export default function reorder( forString, inList ) {
  const TIMESTAMP = Date.now();
  const SEARCHSTRING = sanitize( forString );

  const SEARCHARRAY = new Array( SEARCHSTRING.length - 2 ).fill( SEARCHSTRING ).map( ( searchItem, index ) => {
    // following line adapted from
    // https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
    // accessed March 12, 2021
    return new RegExp( searchItem.substr( index, 3 ).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g" )
  });

  const RELEVANCE = new Array( inList.children.length ).fill( 0 );

  Array.from( inList.children ).forEach( ( node, index ) => {
    let text = ""
    node.querySelectorAll( "*" ).forEach( ( subNode ) =>  {
      text += subNode.innerText
    });
    SEARCHARRAY.forEach( ( searchItem ) => {
      try {
        // following line adapted from
        // https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
        // accessed March 12, 2021
        RELEVANCE[index] += ( text.match( searchItem ) || [] ).length;
      } finally {}
    });
  });

  Array.from( Array.from( RELEVANCE.keys() ).sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] ), ( key ) => inList.children[key] )
    .forEach( ( child ) => { inList.appendChild( child ) });
  console.info( `searched for '${SEARCHSTRING}' in ${Date.now() - TIMESTAMP}ms` );
};
