"use strict";

export let _secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );

class Mothership {
  constructor( blueprints, secret ) {
    const _secret = secret;
    const _data = blueprints.data;

    let variables = blueprints.variables;

    for ( let i = blueprints.validations.length - 1; i >= 0; i-- ) {
      Object.defineProperty( this, blueprints.validations[i].varIndex, {
        get: () => variables[blueprints.validations[i].varIndex],
        set: ( value ) => blueprints.validations[i].action( value )
      } )
    }

    // lock bot from modification
    Object.seal(this);
  }
}

class DOMbot {
  constructor( blueprints = undefined, secret = undefined ) {
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
      if ( blueprints.Event !== undefined && typeof blueprints.Event.Listener === "function" ) {
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
    Action();

    // lock bot from modification
    Object.freeze(this);
  }
}

// send command to DOMbots
export let SendCommand = ( bot, data ) => {
  bot.id = {
    secret : _secret,
      data : data
  }
}

export function Factory( blueprints ) {
  window[blueprints.name] = new Mothership( blueprints, _secret );
  for ( let i = 0, len = blueprints.bots.length; i < len; i++ ) {
    window[`${blueprints.bots[i].id}_BOT`] = new DOMbot( blueprints.bots[i], _secret );
  }
}
