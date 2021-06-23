import reorder from "./reorder.mjs";

customElements.define( "search-bot", class extends HTMLElement {
  constructor() {
    super();

    // attach closed shadowRoot to element
    const shadowRoot = this.attachShadow({ mode: "closed" });

    /* -[ LINK ]-- --- --- --- --- --- --- --- --- --- --- --- --- */
    // create link element
    const stylesheet = document.createElement( "link" );

    // point link element to search.css
    stylesheet.href = "css/search.css";

    // set link relationship to stylesheet
    stylesheet.rel = "stylesheet";

    // set link type to css
    stylesheet.type = "text/css";

    // append link to shadowRoot
    void shadowRoot.appendChild( stylesheet );


    // create preload link for search icon
    const preload = document.createElement( "link" );

    // point link element to search-icon-glow.svg
    preload.href = "images/search-icon-glow.svg";

    // set link relationship to preload
    preload.rel = "preload";

    // set specify preload as image
    preload.as = "image";

    // append preload link to shadowRoot
    void shadowRoot.appendChild( preload );
    /* --- --- --- --- --- --- --- --- --- --- --- --- --[ LINK ]- */

    /* -[ FORM ]-- --- --- --- --- --- --- --- --- --- --- --- --- */
    // create form element
    const form = document.createElement( "form" );

    // attach form to shadowRoot
    void shadowRoot.appendChild( form );


    // create input textbox
    const inputText = document.createElement( "input" );

    // set input type to text
    inputText.type = "text";

    // set placeholder text
    inputText.placeholder = "Search for keywords...";

    // attach text box to form
    void form.appendChild( inputText );


    // create submit button
    const inputSubmit = document.createElement( "input" );

    // set input type to submit
    inputSubmit.type = "submit";

    // clear default value of submit button
    inputSubmit.value = "";

    // attach submit button to form
    void form.appendChild( inputSubmit );


    // create event to search through list
    form.onsubmit = ( event ) => {
      void event.preventDefault();
      void event.stopPropagation();
      void this.setAttribute( "search", inputText.value );
    };
    /* --- --- --- --- --- --- --- --- --- --- --- --- --[ FORM ]- */

    // create reflection property for search attribute
    Object.defineProperty( this, "search", {
      get: () => this.getAttribute( "search" ),
      set: ( string ) => this.setAttribute( "search", string ?? "" )
    });

    // create reflection property for display attribute
    Object.defineProperty( this, "display", {
      get: () => this.getAttribute( "display" ),
      set: ( number ) => this.setAttribute( "display", number ?? 10 )
    });

    // get current url
    Object.defineProperty( this, "pageUrl", { value: new URL( window.location.href ) } );

    // prevent changes to search-bot
    Object.seal( this );
  }

  // run when search-bot is connected
  connectedCallback() {

    // verify search-bot is connected to DOM
    if ( this.isConnected ) {

      // if search string is present in url
      if ( this.pageUrl.searchParams.has( "search" ) ) {

        // then set search attribute to search string
        this.search = this.pageUrl.searchParams.get( "search" );
      }

      // if display count is present in url
      if ( this.pageUrl.searchParams.has( "display" ) ) {

        // then set search attribute to display
        this.display = this.pageUrl.searchParams.get( "display" );
      }
    }
  }

  // run when search-bot is adopted
  adoptedCallback() {

    // if search-bot is connected to DOM and the url contains a search string
    if ( this.isConnected && this.pageUrl.searchParams.has( "search" ) ) {

      // then set search attribute to search string
      this.search = this.pageUrl.searchParams.get( "search" );
    }
  }

  // run when search-bot is disconnected
  disconnectedCallback() {

    // select header
    const header = document.querySelector( "header" )

    // create heading element
    const pageTitle = document.createElement( "h1" );

    // set text of heading element
    pageTitle.innerText = "David Kellogg"

    // append heading to header
    void header.appendChild( pageTitle );

    // update the current url without search string
    void window.history.replaceState( null, null, this.pageUrl.pathname );
  }

  // get list of observerd attributes
  static get observedAttributes() { return ["search", "display"]; }

  // run when observed attributes change value
  attributeChangedCallback( name, oldValue, newValue ) {

    // if the value has changed
    if ( newValue !== oldValue ) {

      // if search string is at least three letters
      if ( name === "search" && newValue.length > 2 ) {

        // then reorder searchList by search relevance
        void reorder( newValue, document.querySelector( "#searchList" ) );

      // if the changed attribute is display
      } else if ( name === "display" ) {

        // if the attribute value is a number and greater than 0
        if ( typeof +newValue === "number" && newValue > 0 ) {

          // change specific CSS Rule
          Array.prototype.find.call(
            Array.prototype.find.call(

              // from tilecards.css
              document.styleSheets, styleSheet => /tilecards\.css$/.test( styleSheet.href ) )

            // get current rule
            .cssRules, cssRule => /^\.tilecards > li:nth-child\(\d{0,2}\) ~ li/.test( cssRule.selectorText ) )

          // and update to new value
          .selectorText = `.tilecards > li:nth-child(${newValue}) ~ li`;

        // otherwise revert attribute to default
        } else {
          this.setAttribute( name, 10 );
          return null;
        }
      }

      // set the value of search into pageUrl property
      void this.pageUrl.searchParams.set( name, newValue );

      // update the current url with pageUrl
      void window.history.replaceState( null, null, this.pageUrl );
    }
  };
});
