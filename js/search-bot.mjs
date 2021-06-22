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
      set: ( value ) => this.setAttribute( "search", value ?? "" )
    });

    // get current url
    Object.defineProperty( this, "pageUrl", { value: new URL( window.location.href ) } );

    // align search-bot to end of header
    Array.prototype.filter.call(
      Array.prototype.filter.call(
        document.styleSheets, styleSheet => /structure\.css$/.test( styleSheet.href ) )[0]
      .cssRules, cssRule => cssRule.selectorText === "header" )[0]
    .style["justify-content"] = "end";

    // prevent changes to search-bot
    Object.seal( this );
  }

  // run when search-bot is connected
  connectedCallback() {

    // if search-bot is connected to DOM and the url contains a search string
    if ( this.isConnected && this.pageUrl.searchParams.has( "search" ) ) {

      // then set search attribute to search string
      this.search = this.pageUrl.searchParams.get( "search" );
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

    const header = document.querySelector( "header" )

    // align header contents to center
    Array.prototype.filter.call(
      Array.prototype.filter.call(
        document.styleSheets, styleSheet => /structure\.css$/.test( styleSheet.href ) )[0]
      .cssRules, cssRule => cssRule.selectorText === "header" )[0]
    .style["justify-content"] = "center";

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
  static get observedAttributes() { return ["search"]; }

  // run when observed attributes change value
  attributeChangedCallback( name, oldValue, newValue ) {

    // if search string is at least three letters and the search is new
    if ( newValue.length > 2 && newValue !== oldValue ) {

      // set the value of search into pageUrl property
      void this.pageUrl.searchParams.set( "search", newValue );

      // update the current url with pageUrl
      void window.history.replaceState( null, null, this.pageUrl );

      // then reorder searchList by search relevance
      void reorder( newValue, document.querySelector( "#searchList" ) );
    }
  };
});
