import reorder from "./reorder.mjs";

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
      search.value.length > 2 && void this.setAttribute( "search", search.value );
    }

    // attach events to tags for searching
    void searchList.querySelectorAll( "ul > li" ).forEach( li => {
      li.onclick = ( event ) => {
        void event.preventDefault();
        void event.stopPropagation();
        search.value = `tag:${li.innerText}`;
        void submit.click();
      }
    });
    /* --- --- --- --- --- --- --- --- --- --- --- --- --- */


    // insert CSS rules
    const tilecardsStyleSheet = [ ...document.styleSheets ].find( styleSheet => /tilecards\.css$/.test( styleSheet.href ) );
    void tilecardsStyleSheet.insertRule( ".tilecards ul > li:hover { background-color: #FFCC0040; }", tilecardsStyleSheet.cssRules.length );
    void tilecardsStyleSheet.insertRule( ".tilecards > li:nth-child(10) ~ li { display: none; }", tilecardsStyleSheet.cssRules.length );

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
    const tilecardsStyleSheet = [ ...document.styleSheets ].find( styleSheet => /tilecards\.css$/.test( styleSheet.href ) );
    void tilecardsStyleSheet.deleteRule( [...tilecardsStyleSheet.cssRules].findIndex( cssRule => ".tilecards ul > li:hover" === cssRule.selectorText ) );
    void tilecardsStyleSheet.deleteRule( [...tilecardsStyleSheet.cssRules].findIndex( cssRule => /^\.tilecards > li:nth-child\(\d{0,2}\) ~ li/.test( cssRule.selectorText ) ) );

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

        const search = newValue.split(":");
        const query = (() => {

          // search query for tags
          if ( search[0].toLowerCase() === "tag" ) {
            void search.shift();
            return "ul";

          // search query for titles
          } else if ( search[0].toLowerCase() === "title" ) {
            void search.shift();
            return "h4";

          // default search query
          } else {
            return ":scope > *";
          }
        })();

        // concatenate search back together
        const filteredSearch = search.join(":");

        if ( filteredSearch.length > 2 ) {

          // then reorder searchList by search relevance
          void reorder( filteredSearch, searchList.querySelectorAll( query ) )
            .map( key => searchList.children[key] )
            .forEach( child => searchList.appendChild( child ) );

          // send success message to console
          console.debug( `searched for '${search}' in ${performance.now() - timestamp}ms` );

        // send failure message to console
        } else {
          console.debug( "search must be at least 3 characters" );
        }


      // if the changed attribute is display
      } else if ( name === "display" ) {

        // if the attribute value is a number and greater than 0
        if ( typeof +newValue === "number" && newValue > 0 ) {

          // update CSS Rule to new display number
          Array.prototype.find.call(

            // get the cssRules from the appropriate styleSheet
            [...document.styleSheets].find( styleSheet => /tilecards\.css$/.test( styleSheet.href ) ).cssRules,

            // get the appropriate cssRule from the styleSheet
            cssRule => /^\.tilecards > li:nth-child\(\d{0,2}\) ~ li/.test( cssRule.selectorText )

          // update selectorText of cssRule
          ).selectorText = `.tilecards > li:nth-child(${newValue}) ~ li`;

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
  };
});
