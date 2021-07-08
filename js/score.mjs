export default function score( forString, inList ) {

  // construct search criteria from search string
  // create array to store search criteria and fill each index with search string
  // change each search string into regular expression for efficient searching
  // cut search string down to three characters and replace with regular expression
  const SEARCHARRAY = new Array( forString.length - 2 ).fill( forString ).map( ( currentString, index ) => new RegExp( currentString.substr( index, 3 ).replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi" ) );

  // score the relevance of inList's children by search string
  // create an array to store relevance scoring
  // run scoring function on each of inList's children elements
  // on each child, match the innerText against SEARCHARRAY to generate relevance score
  const RELEVANCE = [...inList].map( child => SEARCHARRAY.reduce( ( accumulator, currentValue ) => accumulator + child.innerText.match( currentValue )?.length || 0, 0 ) );

  // reorder inList's children by relevance
  // stage elements for reorder
  // create new array from the keys of the relevance scored array and sort them by relevance
  // then reorder inList children by relevance
  // return the reordered element
  return [...RELEVANCE.keys()].sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] );
}
