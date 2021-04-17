"use strict";

import DomBot from "../bots/dom-bot.js";
import reorder from "../utilities/reorder.js";

customElements.define( "dom-bot", DomBot );

/* --------------[ dom-bot ]-------------- */

const bot =  document.createElement("dom-bot");

bot.append( "link" )
  .attribute( "rel", "stylesheet" )
  .attribute( "href", "../css/search.css" );

const FORM = bot.append( "form" );

// create form
FORM.append( "input" )
  .attribute( "type", "text" )
  .attribute( "placeholder", "Search for keywords..." )

FORM.append( "input" )
  .attribute( "type", "submit" )
  .attribute( "value", "Search" )

const LIST = document.querySelector(".search-bot");

bot.action( FORM )
  .setType( "onsubmit" )
  .setListener( ( value ) => reorder( value, LIST ) )
  .setAttributeName( "search" )
  .setAttributeValue( () => FORM.firstChild.value )

document.querySelector("main").insertBefore( bot, LIST )
