"use strict";

export default class Framework {
  constructor( element ) {
    const TARGET = ( ( element ) => {
      // if element is an HTMLElement
      if ( element instanceof Node ) {
        return element;

      // if element is an HTMLElement
      } else if ( element instanceof Framework ) {
        return element.target;

      // if element is a tagName
      } else if ( typeof element === "string" ) {
        return document.createElement( element );

      // error handling
      } else {
        throw new TypeError( typeof element );
      }
    })( element );

    // expose ELEMENT as read-only
    Object.defineProperty( this, "target", {
      get: () => TARGET
    });
  }
}
