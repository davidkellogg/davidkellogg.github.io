"use strict";

// Mothership class
class Mothership {
  constructor( { variables: variables, validations: validations }, secret ) {
    // declare public interface
    validations.forEach( ( { varIndex: varIndex, action: action } ) =>
      Object.defineProperty( this, varIndex, {
        get: () => variables[varIndex],
        set: ( { secret: key, message: value } ) => {
          if ( key === secret ) {
            action( value, sendCommand );
            // let method = new Function( `return ${action.toString()}` );
            // console.log(method);
            // method( value, sendCommand );
          } else {
            console.info( "could not validate the authenticity of the message relayed to the mothership." );
          }
        }
      } )
    );

    // communication channel to DOMbots
    const sendCommand = ( commands ) => {
      // if `commands` is not an array, wrap in array
      if ( !Array.isArray( commands ) ) {
        commands = [ commands ];
      }
      // parse `commands`
      if ( Array.isArray( commands ) ) {
        commands.forEach( ( command ) => {
          // declare variables so available in scope for eventual command
          let bot = undefined, data = undefined;
          try {
            if ( typeof command === "object" ) {
              // if `command` is an object, destructure
              ( { bot, data } = command );
            } else {
              // otherwise, assume the command does not contain `data`
              // and assign value to `bot`
              bot = command;
            }

            // if bot is a reference to DOM element, strip out ID
            if ( bot instanceof HTMLElement ) {
              bot = bot.getAttribute( "id" );
            }

            // if ( bot instanceof HTMLElement ) {}
            window[`${bot}_BOT`].action = {
              secret: secret,
              data: data
            }
          } catch(error) {
            // if unable to send command, provide feedback in the console
            console.info( `malformed command: ${command}`);
            console.error( error );
          }
        } );
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
    let _id = id instanceof HTMLElement ? id : undefined;

    // declare public interface
    Object.defineProperties( this, {
      action: {
        set: ( { secret: key, data: data } ) => {
          if ( key === secret ) {
            action( { id: _id, data: data, mothership: mothership, relayMessage: relayMessage } );
          } else {
            console.info( "cannot set value of `action`" );
          }
        }
      }
    } );

    // communication channel to mothership
    const relayMessage = ( property, message ) => {
      mothership[property] = {
        secret: secret,
        message: message
      }
    }

    // set the function for action
    let action = undefined;
    if ( methods !== undefined ) {
      // if `methods` is not array, wrap in array
      if ( typeof methods === "function" ) {
        methods = [ methods ];
      }
      // parse `commands`
      if ( Array.isArray( methods ) ) {
        methods.forEach( ( method, index ) => {
          // generate element reference
          if ( _id instanceof HTMLElement === false ) {
            _id = document.querySelector( `#${id}` );
          }

          // assign `function` to `action()`
          if ( typeof method === "function" ) {
            action = method;
          }

          // attempt to perform action
          try {
            action( { id: _id, mothership: mothership, relayMessage: relayMessage } );
          } catch( error ) {
            console.info( `malformed command: ${method}`);
            console.error( error );
          }
        } ); // end methods forEach() loop
      }
    } else {
      console.error( `no actions were declared for ${_id}_BOT` )
    }

    // prevent changes to the bot
    Object.freeze( this );
  }
}

// factory for creating Mothership and DOMbots
export default function factory( blueprints ) {
  const _secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );
  window[blueprints.name] = new Mothership( blueprints, _secret );
  blueprints.bots.forEach( ( bot ) => {
    // run anonymous DOMbot commands
    if ( bot.name === undefined & bot.id === undefined ) {
      // check if anonymous DOMbot's actions are in an array
      if ( typeof bot.action === "function" ) {
        bot.action = [ bot.action ];
      }
      // begin anonymous DOMbot forEach() loop
      bot.action.forEach( ( action ) => {
        try {
          // anonymous communication channel to mothership
          action( ( property, message ) => {
            window[blueprints.name][property] = {
              secret: _secret,
              message: message
            }
          } );
        } catch( error ) {
          // if unable to execute action, send feedback to console
          console.info( `malformed action: ${action}`);
          console.error( error );
        }
      } ); // end anonymous DOMbot forEach() loop
      return null;
    } // end anonymous DOMbot commands

    // construct name for DOMbot
    let name = "_BOT";
    if ( bot.name !== undefined ) {
      // if `name` property is present
      name = bot.name + name;
    } else if ( bot.id !== undefined && typeof bot.id === "string" ) {
      // if `id` property is present and a string
      name = bot.id + name;
    } else if ( bot.id !== undefined && bot.id instanceof HTMLElement ) {
      // if `id` property is present and an element reference
      name = bot.id.getAttribute( "id" ) + name;
    }

    // instantiate DOMbot
    window[name] = new DOMbot( bot, _secret, window[blueprints.name] );
  } ); // end DOMbot forEach() loop
}
