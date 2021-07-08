export default function reorder( forTag, inList ) {

  // score the relevance of inList's children by search string
  // create an array to store relevance scoring
  // run scoring function on each of inList's children elements
  // on each child, match the innerText against SEARCHARRAY to generate relevance score
  const RELEVANCE = [...inList].map( child => [...child.children].map( grandchild => grandchild.innerText ).includes( forTag ) ? 1 : 0 );

  // reorder inList's children by relevance
  // stage elements for reorder
  // create new array from the keys of the relevance scored array and sort them by relevance
  // then reorder inList children by relevance
  // return the reordered element
  return [...RELEVANCE.keys()].sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] );
}
