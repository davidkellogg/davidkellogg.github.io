"use strict";

// import functions
import sanitize from "./sanitize.js";

export default function reorder( forString, inList ) {
  const TIMESTAMP = Date.now();

  // construct all search criteria as RegEx
  const SEARCHFOR = new Array( forString.length - 2 ).fill( forString ).map( ( currentValue, index ) =>
    new RegExp( sanitize( currentValue.substr( index, 3 ) ).replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g" ) );

  // construct a scored relevance array
  const RELEVANCE = Array.prototype.map.call( inList.children, ( node ) => Array.prototype.reduce.call( SEARCHFOR,
    ( accumulator, currentValue ) => accumulator + ( node.innerText.match( currentValue ) || [] ).length, 0 ) );

  // stage elements for reorder
  const NEWORDER = Array.prototype.map.call( [ ...RELEVANCE.keys() ].sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] ),
    ( key ) => inList.children[key] );

  // reorder elements
  NEWORDER.forEach( ( child ) => inList.appendChild( child ) );

  console.info( `searched for '${forString}' in ${Date.now() - TIMESTAMP}ms` );

  return inList;
};
