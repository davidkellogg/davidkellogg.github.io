"use strict";

import { getBot, getTemplate } from "./utilities/get-module.js";

// instantiate search-bots
document.querySelectorAll( ".search" ).forEach( ( list, index ) => {

  if ( index === 0 ) {
    // define dom-bot
    getBot( "dom-bot" ).then( ( bot ) => customElements.define( "dom-bot", bot ) );

    // instantiate url-bot
    getBot( "url-bot" ).then( ( UrlBot ) => window.urlBot = new UrlBot() );
  };

  // instantiate search-bot
  customElements.whenDefined( "dom-bot" )
    .then( ( element ) => {

      // get search-bot template
      return getTemplate( "search-template" )
    }).then( ( search ) => {

      // assign search-bot template
      const bot = search.template;

      // update search-bot actions
      bot.actions.forEach( ( action ) => {
        if ( action.type === "onsubmit"
          && action.attributeName === "search" ) {
            action.setListener( ( value ) => search.reorder( value, list ) );
        };
      });

      // insert search-bot into DOM
      document.body.querySelector( "header" ).insertAdjacentElement( "beforeend", bot );
      // list.parentElement.insertBefore( bot, list );

      // register search-bot
      window.urlBot.observe( bot, search.observables );
    }).catch( ( error ) => console.error( error ) );
});
