"use strict";

import reorder from "../utilities/reorder.js";

const search = {
  // create search-bot element
  get template() {
    const bot = document.createElement("dom-bot");

    // link to CSS styling
    bot.append( "link" )
      .attribute( "rel", "stylesheet" )
      .attribute( "href", "../css/search.css" );

    // create form element
    const FORM = bot.append( "form" );

    // create text input
    FORM.append( "input" )
      .attribute( "type", "text" )
      .attribute( "placeholder", "Search for keywords..." );

    // create submit button
    FORM.append( "input" )
      .attribute( "type", "submit" )
      .attribute( "value", "Search" );

    // stage onsubmit event listener
    bot.action( FORM )
      .setType( "onsubmit" )
      .setAttributeName( "search" )
      .setAttributeValue( () => FORM.firstChild.value );

    return bot;
  },

  // reorder function for seach-bot
  get reorder() {
    return reorder;
  },

  // observable attributes for search-bot
  get observables() {
    return {
      attributes: true,
      attributeFilter: ["search"]
    };
  }
};

Object.freeze( search );

export default search;
