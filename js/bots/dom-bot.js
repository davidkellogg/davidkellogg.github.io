"use strict";

// import functions and bots
import createElement from "../createElement.js";
import UrlBot from "./url-bot.js";
import SearchBot from "./search-bot.js";

export default function DomBot( element, bind ) {
// export default function searchBot( element ) {
  if ( bind instanceof HTMLElement ) {

    if ( element = "search-bot" ) {
      customElements.define( "search-bot", SearchBot );

      // load script
      document.head.appendChild( createElement({
        script: {
          src: "../js/bots/search-bot.js",
          type: "module"
        }
      }));
    }

    // insert SearchBot
    const parent = bind.parentElement;
    const observedElement = document.createElement( element );
    observedElement.appendChild( bind );
    parent.appendChild( observedElement );

    // const observedElement = bind.parentElement
    //   .appendChild( document.createElement( element ) )
    //   .appendChild( bind ).parentElement;

    // instantiate url-bot
    window.urlBot = new UrlBot();

    if ( observedElement instanceof SearchBot ){
      // set observation
      window.urlBot.observe( observedElement, {
        attributes: true,
        attributeFilter: ["search"]
      });
    }

    return observedElement;
  }
}
