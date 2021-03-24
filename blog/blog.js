"use strict";

// import functions
import reorder from "../js/reorder.js";

customElements.define( "search-bot", class extends HTMLElement {
  constructor() {
    const TIMESTAMP = Date.now();
    super();
    new Promise( ( resolve ) => {
      // set slot for list
      this.querySelector("li").parentElement.setAttribute( "slot", "list");

      // create shadowRoot and pass through chain
      resolve( this.attachShadow({ mode: "closed" }) );

    // insert form stylesheet
    }).then( ( shadowRoot ) => {
      shadowRoot.appendChild( (() => {
        const ELEMENT = document.createElement( "link" );
        ELEMENT.setAttribute( "rel", "stylesheet" );
        ELEMENT.setAttribute( "href", "../css/search.css" );
        return ELEMENT;
      })());
      return shadowRoot;

    // create form
    }).then( ( shadowRoot ) => {
      const form = document.createElement( "form" );

      // create text input
      const input = form.appendChild( (() => {
        const ELEMENT = document.createElement( "input" );
        ELEMENT.setAttribute( "type", "text" );
        ELEMENT.setAttribute( "placeholder", "Search for keywords..." );
        return ELEMENT;
      })());

      // create submit button
      form.appendChild( (() => {
        const ELEMENT = document.createElement( "input" );
        ELEMENT.setAttribute( "type", "submit" );
        ELEMENT.setAttribute( "value", "Search" );
        return ELEMENT;
      })());

      // add submit event listener
      form.onsubmit = ( event ) => {
        event.preventDefault();
        event.stopPropagation();
        this.setAttribute( "search", input.value );
      };

      // append form
      shadowRoot.appendChild( form );
      return shadowRoot;

    // append slot for list
    }).then( ( shadowRoot ) => {
      shadowRoot.appendChild( (() => {
        const ELEMENT = document.createElement( "slot" );
        ELEMENT.setAttribute( "name", "list" );
        return ELEMENT
      })());

    // close out promise
    }).then( () => {
      Object.freeze(this);
      console.info( `'search-bot' initialized in ${Date.now() - TIMESTAMP}ms` );
    }).catch( ( error ) => { console.error( error ) });
  } // end of constructor

  // set default attributes
  connectedCallback(){
    this.setAttribute( "search" , "" );
    // this.setAttribute( "display" , "10" );
  }

  // watch for attribute changes
  static get observedAttributes() { return [ 'search', 'display' ] };
  attributeChangedCallback( name, oldValue, newValue ) {
    if ( name === "search"
      && newValue.length > 2 ) {
        reorder( newValue, this.querySelector("*[slot='list']") );
    }
  }

  // disconnectedCallback(){}
  // adoptedCallback(){}
});
