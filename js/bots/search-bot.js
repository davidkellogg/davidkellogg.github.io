"use strict";

// import functions
import reorder from "../reorder.js";
import createElement from "../createElement.js";
import slot from "../createSlotElement.js";

export default class SearchBot extends HTMLElement {
  constructor() {
    const TIMESTAMP = Date.now();
    super();

    new Promise( ( resolve ) => {
      // create shadowRoot and pass through chain
      resolve( this.attachShadow({ mode: "closed" }) );

    }).then( ( shadowRoot ) => {

      // insert form stylesheet
      shadowRoot.appendChild( createElement({
        link: {
          rel: "stylesheet",
          href: "../css/search.css"
        }
      }));

      return shadowRoot;

    }).then( ( shadowRoot ) => {

      const FORM = shadowRoot.appendChild( document.createElement( "form" ) );

      // create text input
      FORM.appendChild( createElement({
        input: {
          type: "text",
          placeholder: "Search for keywords..."
        }
      }));

      // create submit button
      FORM.appendChild( createElement({
        input: {
          type: "submit",
          value: "Search"
        }
      }));

      // set event handler
      FORM.onsubmit = ( event ) => {
        event.preventDefault();
        event.stopPropagation();
        this.setAttribute( "search", shadowRoot.querySelector( "input[type='text']" ).value );
      };

      return shadowRoot;

    }).then( ( shadowRoot ) => {

      // append slot for list
      shadowRoot.appendChild( slot( "list" ) );

    // error handling
    }).catch( ( error ) => { console.error( error ) });

    Object.freeze(this);
    console.info( `'search-bot' initialized in ${Date.now() - TIMESTAMP}ms` );
  } // end of constructor

  // set default attributes
  connectedCallback() {
    // set slot for list
    this.querySelector("li").parentElement.setAttribute( "slot", "list");
  }

  // watch for attribute changes
  static get observedAttributes() { return [ 'search', 'display' ] };

  attributeChangedCallback( name, oldValue, newValue ) {
    if ( name === "search"
      && oldValue !== newValue
      && newValue.length > 2 ) {
        reorder( newValue, this.querySelector("*[slot='list']") );
    }
  }

  // disconnectedCallback(){}
  // adoptedCallback(){}
};
