"use strict";

// convert `value` to array if not already an array
const convertToArray = ( value ) => Array.isArray( value ) ? value : [ value ];

// Mothership class
class Mothership {
  constructor( { data: data, dataProcessing: dataProcessing, variables: variables, variableProcessing: variableProcessing }, secret ) {
    // declare data methods
    convertToArray( dataProcessing ).forEach( ( { name: name, action: action } ) =>
      Object.defineProperty( data, name, {
        get: () => new Function(`return ( variables, data ${action.toString().substr(1)}`)()( variables, data )
      } )
    );

    // declare public interface
    convertToArray( variableProcessing ).forEach( ( { variable: variable, action: action } ) =>
      Object.defineProperty( this, variable, {
        get: () => variables[variable],
        set: ( { secret: key, message: value } ) => {
          if ( key === secret ) {
            new Function(`return ( sendCommand, variables, data, ${action.toString().substr(1)}`)()( sendCommand, variables, data, value );
          } else {
            console.info( "could not validate the authenticity of the message relayed to the mothership." );
          }
        }
      } )
    );

    // communication channel to DOMbots
    const sendCommand = ( commands ) => {
      // parse `commands`
      convertToArray( commands ).forEach( ( order ) => {
        // declare variables so available in scope for eventual command
        let bot = undefined, command = undefined;
        try {
          if ( typeof order === "object" ) {
            // if `command` is an object, destructure
            ( { bot, command } = order );
          } else {
            // otherwise, assume the command does not contain `data`
            // and assign value to `bot`
            bot = order;
          }

          // if bot is a reference to DOM element, strip out ID
          if ( bot instanceof HTMLElement ) {
            bot = bot.getAttribute( "id" );
          }

          // if ( bot instanceof HTMLElement ) {}
          window[`${bot}_BOT`].action = {
            secret: secret,
            command: command
          }
        } catch(error) {
          // if unable to send command, provide feedback in the console
          console.info( `malformed command: ${order}`);
          console.error( error );
        }
      } );
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
        set: ( { secret: key, command: command } ) => {
          if ( key === secret ) {
            action( relayMessage, _id, mothership, command );
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
      // parse `commands`
      convertToArray( methods ).forEach( ( method ) => {
        // generate element reference
        if ( _id instanceof HTMLElement === false ) {
          _id = document.querySelector( `#${id}` );
        }

        // assign `function` to `action()`
        if ( typeof method === "function" ) {
          action = new Function(`return ( relayMessage, id, mothership, ${method.toString().substr(1)}`)();
        }

        // attempt to perform action
        try {
          action( relayMessage, _id, mothership );
        } catch( error ) {
          console.info( `malformed command: ${method}`);
          console.error( error );
        }
      } ); // end methods forEach() loop
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
  const mothership = blueprints.name !== undefined ? blueprints.name : "mothership";

  window[mothership] = new Mothership( blueprints, _secret );
  blueprints.bots.forEach( ( bot ) => {
    // run anonymous DOMbot commands
    if ( bot.name === undefined & bot.id === undefined ) {
      // begin anonymous DOMbot forEach() loop
      convertToArray( bot.action ).forEach( ( action ) => {
        try {
          // anonymous communication channel to mothership
          action( ( property, message ) => {
            window[mothership][property] = {
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
    window[name] = new DOMbot( bot, _secret, window[mothership] );
  } ); // end DOMbot forEach() loop
}
