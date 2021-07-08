import score from "./score.mjs";
import match from "./match.mjs";
import latest from "./latest.mjs";

// define search-component element
customElements.define( "search-component", class extends HTMLElement {
  constructor() {
    const timestamp = performance.now();
    super();


    /* -[ create properties ]- --- --- --- --- --- --- --- */
    // attach closed shadowRoot to search-component
    const shadowRoot = this.attachShadow({ mode: "closed" });

    // create reflection property for search attribute
    void Object.defineProperty( this, "search", {
      get: () => this.getAttribute( "search" ),
      set: ( string ) => this.setAttribute( "search", string ?? "" )
    });

    // create reflection property for display attribute
    void Object.defineProperty( this, "display", {
      get: () => this.getAttribute( "display" ),
      set: ( number ) => this.setAttribute( "display", number ?? 10 )
    });

    // create property for tilecards stylesheet access
    void Object.defineProperty( this, "tilecardsStyleSheet", { value: [ ...document.styleSheets ].find( styleSheet => /tilecards\.css$/.test( styleSheet.href ) ) });

    // prevent changes to search-component
    void Object.seal( this );
    /* --- --- --- --- --- --- --- --- --- --- --- --- --- */


    /* -[ create elements ]--- --- --- --- --- --- --- --- */
    // link stylesheet for search box
    const searchStyleSheet = document.createElement( "link" );
    searchStyleSheet.href = "css/search.css";
    searchStyleSheet.rel = "stylesheet";
    searchStyleSheet.type = "text/css";
    void shadowRoot.appendChild( searchStyleSheet );


    // preload hover image for search icon
    const preload = document.createElement( "link" );
    preload.href = "images/search-icon-glow.svg";
    preload.rel = "preload";
    preload.as = "image";
    preload.type = "image/svg+xml";
    void shadowRoot.appendChild( preload );


    // create form element
    const form = document.createElement( "form" );
    void shadowRoot.appendChild( form );

    // create search input textbox
    const search = document.createElement( "input" );
    search.type = "text";
    search.placeholder = "Search for keywords...";
    void form.appendChild( search );

    // create submit button
    const submit = document.createElement( "button" );
    submit.type = "submit";
    void form.appendChild( submit );
    /* --- --- --- --- --- --- --- --- --- --- --- --- --- */


    /* -[ create events ]- --- --- --- --- --- --- --- --- */
    // create event to search through list
    form.onsubmit = ( event ) => {
      void event.preventDefault();
      void event.stopPropagation();
      search.value = search.value;
      void this.setAttribute( "search", search.value );
    }

    // attach events to tags for searching
    void searchList.querySelectorAll( "ul > li" ).forEach( li => {
      li.onclick = ( event ) => {
        void event.preventDefault();
        void event.stopPropagation();
        search.value = `tag:${li.innerText}`;
        void this.setAttribute( "search", `tag:${li.innerText}` );
      }
    });
    /* --- --- --- --- --- --- --- --- --- --- --- --- --- */

    // insert CSS rules
    this.tilecardsStyleSheet.insertRule( ".tilecards ul > li:hover { background-color: #FFCC0040; }", this.tilecardsStyleSheet.cssRules.length );
    this.tilecardsStyleSheet.insertRule( ".tilecards > li:nth-child(10) ~ li { display: none; }", this.tilecardsStyleSheet.cssRules.length );

    // send message to console
    console.debug( `search-component instantiated in ${performance.now() - timestamp}ms` );
  }

  // run when search-component is connected to document
  connectedCallback() {}

  // run when search-component is adopted to iFrame
  adoptedCallback() {

    // run the code encapsulated in connectedCallback
    void this.connectedCallback();
  }

  // run when search-component is disconnected from document
  disconnectedCallback() {

    // remove events to tags for searching
    void searchList.querySelectorAll( "ul > li" ).forEach( li => li.onclick = undefined );

    // remove inserted CSS rules
    void this.tilecardsStyleSheet.deleteRule( [...tilecardsStyleSheet.cssRules].findIndex( cssRule => ".tilecards ul > li:hover" === cssRule.selectorText ) );
    void this.tilecardsStyleSheet.deleteRule( [...tilecardsStyleSheet.cssRules].findIndex( cssRule => /^\.tilecards > li:nth-child\(\d{0,2}\) ~ li/.test( cssRule.selectorText ) ) );

    // send message to console
    console.debug( "search-component disconnected from document" );
  }

  // get list of observerd attributes
  static get observedAttributes() { return [ "search", "display" ]; }

  // run when observed attributes change value
  attributeChangedCallback( name, oldValue, newValue ) {
    const timestamp = performance.now();

    // if the value has changed
    if ( newValue !== oldValue ) {

      // if search string is at least three letters
      if ( name === "search" ) {

        // get search relevance
        (() => {

          // break search into array
          let search = newValue.split(":");

          // search query for tags
          if ( search[0].toLowerCase() === "tag" ) {
            search = search.slice(1).join(":");

            // if search string long enough, perform search
            if ( search.length > 2 ) {
              return match( search, searchList.querySelectorAll( "ul" ) )
            }


          // search query for titles
          } else if ( search[0].toLowerCase() === "title" ) {
            return search.slice(1).join(":");

            // if search string long enough, perform search
            if ( search.length > 2 ) {
              return score( search, searchList.querySelectorAll( "h4" ) );
            }


          // default search query
          } else {
            search = search.join(":");

            // if search string long enough, perform search
            if ( search.length > 2 ) {
              return score( search, searchList.querySelectorAll( ":scope > *" ) );
            }
          }

          // send message to console
          console.debug( "search must be at least 3 characters" );

          // sort new to old
          return latest( searchList.querySelectorAll( "time" ) );

        // then reorder searchList by search relevance
        })().map( key => searchList.children[key] ).forEach( child => searchList.appendChild( child ) );

        // send message to console
        console.debug( `searched for '${newValue}' in ${performance.now() - timestamp}ms` );

      // if the changed attribute is display
      } else if ( name === "display" ) {

        // if the attribute value is a number and greater than 0
        if ( typeof +newValue === "number" && +newValue > 0 ) {

          // find the appropriate display rule from tilecards.css
          [...this.tilecardsStyleSheet.cssRules].find( cssRule => /^\.tilecards > li:nth-child\(\d{0,2}\) ~ li/.test( cssRule.selectorText ) )

            // update selectorText of cssRule
            .selectorText = `.tilecards > li:nth-child(${newValue}) ~ li`;

          // send success message to console
          console.debug( `updated display in ${performance.now() - timestamp}ms` );

        // otherwise revert attribute to default
        } else {
          console.debug( `cannot set display to '${newValue}', reverted to 10` );
          void this.setAttribute( name, 10 ); // placed after console message because otherwise attributeChangedCallback would fire again and print its message first
        }
      }

    // send failure message to console
    } else {
      console.debug( "attribute must contain new value" );
    }

    return null;
  }
});
