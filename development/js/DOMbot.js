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

  let Action = undefined;

  // insert JS into DOM
  if ( blueprints.insert != undefined ) {
    document.querySelector( blueprints.insert.nearbyId ).insertAdjacentHTML( blueprints.insert.position, blueprints.insert.text );
  } // else { console.info( `${_id}_BOT did not insert any JavaScript elements` ) }

  // attach event
  if ( blueprints.event != undefined ) {
    document.querySelector( _id ).addEventListener( `${blueprints.event.type}`, ( event ) => {
      event.preventDefault();
      blueprints.event.Listener();
    } );
  } // else { console.info( `${_id}_BOT did not set any events` ) }

  // declare Action
  if ( typeof blueprints.Action === "function" ) {
    Action = blueprints.Action;
  } // else console.info( `${_id}_BOT contains no actions` );

  // this.SelfDestruct = () => document.querySelector("#search").remove()
  // cannot delete bot, but can delete element bot is looking at + making bot = undefined

  // lock bot from modification
  Object.freeze(this);
}
