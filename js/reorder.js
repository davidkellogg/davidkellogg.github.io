export default function reorder( reorderBy, reorderIn ) {
  Array.from( reorderBy, ( key ) => reorderIn.children[key] ).forEach( ( child ) => {
    reorderIn.appendChild( child );
  });
};
