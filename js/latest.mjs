export default function latest( inList ) {

  // score the relevance of inList's children by search string
  // create an array to store relevance scoring
  // run scoring function on each of inList's children elements
  const RELEVANCE = [...inList].map( time => new Date( time.dateTime ) );

  // reorder inList's children by relevance
  // stage elements for reorder
  // create new array from the keys of the relevance scored array and sort them by relevance
  // then reorder inList children by relevance
  // return the reordered element
  return [...RELEVANCE.keys()].sort( ( a, b ) => RELEVANCE[b] - RELEVANCE[a] );
}
