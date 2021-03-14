export default function search( forString, inList ) {
  const searchArray = new Array( forString.length - 2 ).fill( forString ).map( ( searchItem, index ) => {
    return new RegExp( searchItem.substr( index, 3 ).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g" )
  });
  const relevance = new Array( inList.children.length ).fill( 0 );
  Array.from( inList.children ).forEach( ( node, index ) => {
    node.querySelectorAll( "*" ).forEach( ( subNode ) =>  {
      searchArray.forEach( ( searchItem ) => {
        try {
          relevance[index] += ( subNode.innerText.match( searchItem ) || [] ).length;
        } finally {}
      });
    });
  });
  return Array.from( relevance.keys() ).sort( ( a, b ) => relevance[b] - relevance[a] );
};
