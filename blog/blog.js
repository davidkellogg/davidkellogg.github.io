"use strict";

// import functions
import sanitize from "../js/sanitize.js";
import search from "../js/search.js";
import reorder from "../js/reorder.js";

// insert form stylesheet
document.head.insertAdjacentElement( "beforeend", (() => {
  const element = document.createElement( "link" );
  element.setAttribute( "rel", "stylesheet" );
  element.setAttribute( "href", "../css/search.css" );
  return element;
})());

// find list
const list = document.querySelector("ol");

// create form
const form = document.createElement( "form" )
form.setAttribute( "id", "search" );

// create text input
form.appendChild( (() => {
  const element = document.createElement( "input" );
  element.setAttribute( "type", "text" );
  element.setAttribute( "placeholder", "Search for keywords..." );
  return element;
})());

// create submit button
form.appendChild( (() => {
  const element = document.createElement( "input" );
  element.setAttribute( "type", "submit" );
  element.setAttribute( "value", "Search" );
  return element;
})());

// add submit event listener
form.onsubmit = ( event ) => {
  event.preventDefault();
  reorder( search( sanitize( event.target.children[0].value ), list ), list );
};

// insert form
list.insertAdjacentElement( "beforebegin", form );
