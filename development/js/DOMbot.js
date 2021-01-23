"use strict";

// Mothership class
class Mothership {
  constructor( { data: data, variables: variables, validations: validations }, secret ) {
    // declare private variables
    const _secret = secret;
    const _data = data;
    let _variables = variables;

    // declare public interface
    validations.forEach( ( { varIndex: varIndex, action: action } ) =>
      Object.defineProperty( this, varIndex, {
        get: () => variables[varIndex],
        set: ( { secret: secret, message: message } ) => {
          if ( secret === _secret ) {
            action( message, sendCommand )
          } else {
            console.info( "cannot set value of this property" )
          }
        }
      } )
    );

    // communication channel to bots
    const sendCommand = ( bot, data = undefined ) => {
      window[`${bot}_BOT`].action = {
        secret : _secret,
        data : data
      }
    }

    // prevent further changes to mothership
    Object.seal(this);
  }
}

// DOMbot class
class DOMbot {
  constructor( { id: id, action: methods }, secret = undefined, mothership = undefined ) {
    // declare private variables
    const _secret = secret;
    const _mothership = mothership;
    let _id = undefined;

    // declare public interface
    Object.defineProperties( this, {
      action: {
        set: ( { secret: secret, data: data } ) => {
          if ( secret === _secret ) {
            action( { id: _id, data: data, mothership: _mothership, relayMessage: relayMessage } );
          } else {
            console.info( "cannot set value of `action`" );
          }
        }
      }
    } );

    // communication channel to mothership
    const relayMessage = ( property, message ) => {
      _mothership[property] = {
        secret: _secret,
        message: message
      }
    }

    // set the function for action
    let action = undefined;
    if ( methods !== undefined ) {
      // convert function to array
      if ( typeof methods === "function" ) {
        methods = [ methods ];
      }
      if ( Array.isArray( methods ) ) {
        methods.forEach( ( method, index ) => {
          // generate element reference
          _id = document.querySelector( `#${id}` );

          // assign `function` to `action()`
          if ( typeof method === "function" ) {
            action = method;
          } else undefined;
          action( { id: _id, mothership: _mothership, relayMessage: relayMessage } );
        } );
      }
    }

    // prevent changes to the bot
    Object.freeze( this );
  }
}

// factory for creating Mothership and DOMbots
export default function factory( blueprints ) {
  const _secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );
  window[blueprints.name] = new Mothership( blueprints, _secret );
  blueprints.bots.forEach( ( bot ) => window[`${bot.name !== undefined ? bot.name : bot.id}_BOT`] = new DOMbot( bot, _secret, window[blueprints.name] ) );
}
