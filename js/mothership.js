"use strict";

import DomBot from "./bots/dom-bot.js";
import UrlBot from "./bots/url-bot.js";

import search from "./templates/search-template.js"

customElements.define( "dom-bot", DomBot );

// instantiate search-bots
document.querySelectorAll(".search").forEach( ( list ) => {

  // if url-bot is not instantiated yet, then instantiate
  if ( !( window.urlBot instanceof UrlBot ) ) {
    window.urlBot = new UrlBot();
  }

  // grab search-bot template
  const bot = search.template;

  // update search-bot actions
  bot.actions.forEach( ( action ) => {
    if ( action.type === "onsubmit"
      && action.attributeName === "search" ) {
        action.setListener( ( value ) => search.reorder( value, list ) );
    };
  });

  // insert search-bot into DOM
  list.parentElement.insertBefore( bot, list )

  // register search-bot
  window.urlBot.observe( bot, search.observables );
});
