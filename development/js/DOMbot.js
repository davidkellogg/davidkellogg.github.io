"use strict";

export default function DOMbot( blueprints = undefined, secret = undefined ) {
  // declare private variables
  const _secret = secret;
  const _id = `#${blueprints.id}`;

  // declare public interface
  Object.defineProperties( this, {
    id: {
      get: () => _id,
      set: ( value ) => {
        if ( value.secret === _secret ) {
          Action( value.data );
        } else {
          console.info( "cannot set value of `id`" );
        }
      }
    }
  } );

  // insert JS into DOM
  function Insert() {
    if ( blueprints.Insert !== undefined ) {
      document.querySelector( blueprints.Insert.nearbyId ).insertAdjacentHTML( blueprints.Insert.position, blueprints.Insert.text );
    } else undefined;
  }
  Insert();

  // attach event
  function Event() {
    if ( blueprints.Event !== undefined ) {
      document.querySelector( _id ).addEventListener( `${blueprints.Event.type}`, ( event ) => {
        event.preventDefault();
        blueprints.Event.Listener();
      } );
    } else undefined;
  }
  Event();

  // declare Action
  function Action() {
    if ( typeof blueprints.Action === "function" ) {
      Action = blueprints.Action;
    } else undefined;
  }

  // this.SelfDestruct = () => document.querySelector("#search").remove()
  // cannot delete bot, but can delete element bot is looking at + making bot = undefined

  // lock bot from modification
  Object.freeze(this);
}
