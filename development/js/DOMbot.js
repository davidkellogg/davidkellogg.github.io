"use strict";

// convert `value` to array if not already an array
const convertToArray = ( value ) => Array.isArray( value ) ? value : [ value ];

/* -Bot--------------------------------------------------------------------- */
class Bot {
  construct() {};

  // generic communication channel
  sendMessage( receiver, property, message, key ) {
    receiver[property] = {
      secret: key,
      message: message
    }
  }

  // attempt to execute `methods` return final
  actions( methods, receiver, secret ) {
    let finalAction = undefined;
    // attempt to execute each `method`
    convertToArray( methods ).forEach( ( method ) => {
      try {
        // execute each `method` then set `finalAction`
        method( ( property, message ) => this.sendMessage( receiver, property, message, secret ) );
        finalAction = method;
      } catch( error ) {
        // if unable to execute `method` send feedback to console
        console.info( `malformed action: ${method}`);
        console.error( error );
      }
    } ); // end forEach() loop
    return finalAction;
  }
}
/* ------------------------------------------------------------------------- */

/* -DOMbot------------------------------------------------------------------ */
class DOMbot extends Bot {
  constructor( { id: id, action: methods }, secret, mothership ) {
    super();

    const relayMessage = ( property, message ) => this.sendMessage( mothership, property, message, secret);

    let element = id instanceof HTMLElement ? id : undefined;

    let action = undefined;
    if ( methods !== undefined ) {
      convertToArray( methods ).forEach( ( method ) => {
        // generate element reference
        if ( element instanceof HTMLElement === false ) {
          element = document.querySelector( `#${id}` );
        }

        // assign `function` to `action()`
        if ( typeof method === "function" ) {
          action = new Function(`return ( relayMessage, id, mothership, ${method.toString().substr(1)}`)();
        }

        // attempt to perform action
        try {
          action( relayMessage, element, mothership, undefined );
        } catch( error ) {
          console.info( `malformed command: ${method}`);
          console.error( error );
        }
      } ); // end methods forEach() loop
    } else {
      console.error( `no actions were declared for ${element}_BOT` )
    }

    // declare public interface
    Object.defineProperties( this, {
      action: {
        set: ( { secret: key, message: command } ) => {
          if ( key === secret ) {
            action( relayMessage, element, mothership, command );
          } else {
            console.info( "cannot set value of `action`" );
          }
        }
      }
    } );

    // prevent changes to the bot
    Object.freeze( this );
  }
}
/* ------------------------------------------------------------------------- */

/* -Mothership-------------------------------------------------------------- */
class Mothership extends Bot {
  constructor( { data: data, dataProcessing: dataProcessing, variables: variables, variableInterface: variableInterface }, secret ) {
    super();

    /* -send-commands-to-DOMbots---------------------------------------- */
    const sendCommand = ( commands ) => {
      convertToArray( commands ).forEach( ( message ) => {                      // parse `commands`
        try {
          let bot = undefined, command = undefined;                             // declare variables in-scope variables
          if ( typeof message === "object" ) {                                  // if `command` is an object
            ( { bot, command } = message );                                     // destructure
          } else {                                                              // otherwise, assume the command does not contain `data`
            bot = message;                                                      // and assign value to `bot`
          }
          bot = bot instanceof HTMLElement ? bot.getAttribute( "id" ) : bot;    // if bot is a reference to DOM element, strip out ID
          this.sendMessage( window[`${bot}_BOT`], "action", command, secret );  // send message to bots
        } catch(error) {                                                        // if unable to send command, provide feedback in the console
          console.info( `malformed command: ${message}`);
          console.error( error );
        }
      } );
    }
    /* ----------------------------------------------------------------- */

    /* -declare-data-methods-------------------------------------------- */
    convertToArray( dataProcessing ).forEach( ( { name: name, action: action } ) =>
      Object.defineProperty( data, name, {
        get: () => new Function(`return ( variables, data ${action.toString().substr(1)}`)()( variables, data )
      } )
    );
    /* ----------------------------------------------------------------- */

    /* -declare-public-interface---------------------------------------- */
    convertToArray( variableInterface ).forEach( ( { variable: variable, action: action } ) =>
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
    /* ----------------------------------------------------------------- */

    // prevent further changes to mothership
    Object.seal( this );
  }
}
/* ------------------------------------------------------------------------- */

/* -factory----------------------------------------------------------------- */
export default function factory( blueprints ) {
  const secret = crypto.getRandomValues( new Uint32Array( 16 ) );
  let mothership = blueprints.name !== undefined ? blueprints.name : "mothership";

  /* -Mothership---------------------------------------------------------- */
  // instantiate Motherhsip
  window[mothership] = new Mothership( blueprints, secret );
  /* --------------------------------------------------------------------- */

  /* -instantiate-Bots---------------------------------------------------- */
  blueprints.bots.forEach( ( bot ) => {
    // run anonymous DOMbot commands
    if ( bot.name === undefined & bot.id === undefined ) {
        try {
          new Bot().actions( convertToArray( bot.action ), window[mothership], secret );
        } catch( error ) {
          // if unable to execute action, send feedback to console
          console.info( `malformed action: ${action}`);
          console.error( error );
        } finally {
          return null;
        }
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
    window[name] = new DOMbot( bot, secret, window[mothership] );
  } ); // end DOMbot forEach() loop
  /* --------------------------------------------------------------------- */
}
/* ------------------------------------------------------------------------- */
