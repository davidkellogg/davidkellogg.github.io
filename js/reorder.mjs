export default function reorder( forString, inList ) {
  const TIMESTAMP = Date.now();

  // construct search criteria from search string
  // create array to store search criteria and fill each index with search string
  const SEARCHARRAY = new Array( forString.slice(-2) ).fill( forString )

    // change each search string into regular expression for efficient searching
    .map( ( currentString, index ) => new RegExp(

      // cut search string down to three characters and replace with regular expression
      currentString.substr( index, 3 ).replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g" ) );

  // score the relevance of inList's children by search string
  // create an array to store relevance scoring
  const RELEVANCE = Array.prototype.map

    // run scoring function on each of inList's children elements
    .call( inList.children, ( node ) => Array.prototype.reduce

    // on each child, match the innerText against SEARCHARRAY to generate relevance score
    .call( SEARCHARRAY, ( accumulator, currentValue ) => accumulator + node.innerText.match( currentValue )?.length || 0, 0 ) );

  // reorder inList's children by relevance
  // stage elements for reorder
  Array.prototype.map

    // create new array from the keys of the relevance scored array and sort them by relevance
    .call( [ ...RELEVANCE.keys() ].sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] ),

    // then reorder inList children by relevance
    ( key ) => inList.children[key] ).forEach( ( child ) => inList.appendChild( child ) );

  // post search time in debug log
  console.debug( `searched for '${forString}' in ${Date.now() - TIMESTAMP}ms` );

  // return the reordered element
  return inList;
};
