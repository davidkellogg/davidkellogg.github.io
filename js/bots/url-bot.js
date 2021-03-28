"use strict";

export default class UrlBot {
  constructor() {
    const PAGEURL = new URL( window.location.href );
    const PARAMMANAGER = {};
    const OBSERVER = new MutationObserver( ( mutationList ) => {
      mutationList.forEach( ( mutation ) => {
        PARAMMANAGER[mutation.attributeName] = mutation.target.getAttribute( mutation.attributeName );

        for ( const param in PARAMMANAGER ) {
          PAGEURL.searchParams.set( param, PARAMMANAGER[param] );
        }

        window.history.replaceState( null, null, PAGEURL );
      });
    });

    this.observe = ( element, attributes ) => {
      OBSERVER.observe( element, attributes );
      attributes.attributeFilter.forEach( ( attribute ) => {
        if ( PAGEURL.searchParams.has( attribute ) ) {
          element.setAttribute( attribute, PAGEURL.searchParams.get( attribute ) );
        }
      });
    }

    Object.freeze( this );
  }
}
