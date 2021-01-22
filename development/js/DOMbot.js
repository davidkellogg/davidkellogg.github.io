"use strict";

const _secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );

// Mothership class
class Mothership {
  constructor( { data: data, variables: variables, validations: validations }, secret ) {
    const _secret = secret;
    const _data = data;

    let _variables = variables;

    validations.forEach( ( { varIndex: varIndex, action: action } ) =>
      Object.defineProperty( this, varIndex, {
        get: () => variables[varIndex],
        set: ( value ) => action( value )
      } )
    );

    Object.seal(this);
  }
}

// DOMbot class
class DOMbot {
  constructor( { action: methods, executeFinal: execute = true }, secret = undefined ) {
    // declare private variables
    const _secret = secret;

    // declare public interface
    Object.defineProperties( this, {
      action: {
        set: ( { secret: secret, data: data } ) => {
          if ( secret === _secret ) {
            action( data );
          } else {
            console.info( "cannot set value of `action`" );
          }
        }
      }
    } );

    // set the function for action
    let action = undefined;
    if ( methods !== undefined ) {
      if ( Array.isArray( methods ) ) {
        methods.forEach( ( method, index ) => {
          // assign `function` to `action()`
          if ( typeof method === "function" ) {
            action = method;
          } else undefined;
          // if `executeFinal` is false, do not execute the final function in the sequence
          if ( ( index < ( methods.length - 1 ) || execute ) && action !== undefined ) {
            action();
          }
        } );
      } else if ( typeof methods === "function" ) {
        action = methods;
        if ( execute ) {
          action();
        }
      }
    }

    Object.freeze( this );
  }
}

// send command to DOMbots
export const SendCommand = ( bot, data = undefined ) => {
  bot.action = {
    secret : _secret,
      data : data
  }
}

// factory for creating Mothership and DOMbots
export function Factory( blueprints ) {
  window[blueprints.name] = new Mothership( blueprints, _secret );
  blueprints.bots.forEach( ( bot ) => window[`${bot.id}_BOT`] = new DOMbot( bot, _secret ) );
}
