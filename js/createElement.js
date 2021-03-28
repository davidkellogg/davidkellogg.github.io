"use strict";

export default function createElement( blueprints ) {
  const DOCUMENTFRAGMENT = document.createDocumentFragment();
  for ( const element in blueprints ) {
    const ELEMENT = DOCUMENTFRAGMENT.appendChild( document.createElement( element ) );
    for ( const attribute in blueprints[element] ) {
      ELEMENT.setAttribute( attribute, blueprints[element][attribute] )
    }
  }
  return DOCUMENTFRAGMENT;
}
