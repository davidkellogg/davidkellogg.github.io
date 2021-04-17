import Framework from "../bots/framework.js";
import Action from "../bots/action.js";
import Bot from "../bots/bot.js";

export default class DomBot extends HTMLElement {
  constructor() {
    super();
    const ROOT = this.attachShadow({ mode: "closed" });
    const ACTIONS = [];
    const CALLBACKS = {};

    Object.defineProperties( this, {
      root: {
        get: () => ROOT,
        set: ( target ) => {
          if ( target instanceof Framework
            && !( target instanceof Action ) ) {
              ROOT.appendChild( target.target );
          }
        }
      },
      actions: {
        get: () => ACTIONS
      },
      callbacks: {
        get: () => CALLBACKS
      }
    });
  }

  append( element ) {
    if ( element instanceof Bot ) {
      this.root.appendChild( element.target );
      element.actions.forEach( ( action ) => {
        this.actions.push( action );
      });
    } else if ( element instanceof Action ) {
      this.actions.push( element );
    } else if ( element instanceof Framework ) {
      this.root.appendChild( element.target );
    } else {
      const ELEMENT = new Bot( element );
      this.root.appendChild( ELEMENT.target );
      return ELEMENT;
    }
    return element;
  }

  action( element ) {
    const ACTION = new Action( element );
    this.actions.push( ACTION );
    return ACTION;
  }

  connectedCallback() {
    if ( this.isConnected ) {
      this.actions.forEach( ( action, index ) => {
        action.target[action.type] = ( event ) => {
          event.preventDefault();
          event.stopPropagation();
          this.setAttribute( action.attributeName, action.attributeValue() )
        this.actions[index] = action.attributeName;
        }
      this.callbacks[action.attributeName] = action.listener
      });

      Object.freeze( this.callbacks );
      Object.freeze( this );
    }
  }

  // watch for attribute changes
  static get observedAttributes() { return [ "search" ] };

  attributeChangedCallback( name, oldValue, newValue ) {
    if ( name === "search"
      && oldValue !== newValue
      && newValue.length > 2 ) {
        this.callbacks[ name ]( newValue );
    }
  }

  // connectedCallback(){}
  // disconnectedCallback(){}
  // adoptedCallback(){}
}
