"use strict"

import Framework from "./framework.js";
import Action from "./action.js";

const clamp = ( lower, number, upper ) => Math.min( Math.max( lower, number ), upper );

export default class Bot extends Framework {
  constructor( element ) {
    super( element );
    const ACTIONS = [];

    Object.defineProperties( this, {
      // get and set parent of element
      parent: {
        get: () => this.target.parentElement,
        set: ( parent ) => {
          if ( parent instanceof HTMLElement
            || parent instanceof Framework ) {
              new Framework( parent ).target.appendChild( this.target );
          }
          return this;
        }
      },

      // get the index of element amongst siblings
      index: {
        get: () => Array.prototype.indexOf.call( this.siblings, this.target )
      },

      // get list of siblings
      siblings: {
        get: () => this.parent.children
      },

      // get list of children
      children: {
        get: () => this.target.children
      },

      // get first child
      firstChild: {
        get: () => this.target.children[0]
      },

      // get last child
      lastChild: {
        get: () => this.target.children[ this.target.children.length - 1 ]
      },

      // get actions
      actions: {
        get: () => ACTIONS
      }
    });

    Object.freeze( this );
  }

  isParent( parent ) {
    return parent === this.parent;
  }

  // insert sibling element
  insertSibling( element, position = undefined ) {
    try {
      this.parent.insertBefore( new Framework( element ).target, this.siblings[ Math.max( 0, ( this.index + position ) ?? 1 ) ] );
    // error handling
    } catch ( error ) { console.error( error ) };
    return this;
  }

  // check if element is sibling
  isSibling( element ) {
    return Array.prototype.includes.call( this.siblings, element );
  }

  // insert child element
  append( element, position = undefined ) {
    let framework = undefined;
    try {
      framework = new Framework( element );
      this.target.insertBefore( framework.target, this.children[ Math.max( 0, position ?? this.children.length ) ] );
    // error handling
    } catch ( error ) { console.error( error ) };

    // extend framwork with attribute method
    framework.attribute = this.attribute;
    Object.freeze( framework );

    return framework;
  }

  // check if element is a child
  isChild( element ) {
    return Array.prototype.includes.call( this.children, element );
  }

  nthChild( index ) {
    return this.children[ clamp( 0, index, this.children.length - 1 ) ];
  }

  // set or remove attribute
  attribute( name, value ) {
    // check if value is falsy except 0
    if ( value = value === 0 ? "0" : value || "", value === "" ) {
      this.target.removeAttribute( name );
    } else {
      this.target.setAttribute( name, value );
    }
    return this;
  }

  action() {
    const ACTION = new Action( this );
    this.actions.push( ACTION );
    return ACTION;
  }
}


// // bot tests
// window.bot = new Bot( document.createElement("div") );
// console.info( "element: " + bot.target );
// console.info( "old parent: " + bot.parent );
// bot.parent = document.body;
// console.info( "new parent: " + bot.parent );
// console.info( "index: " + bot.index );
// const HEADINGTWO = bot.insertSibling( "h2" );
// const HEADINGTHREE = new Bot( bot.insertChild( "h3" ) );
// console.info( "siblings: " + bot.siblings );
// console.info( HEADINGTWO.tagName + " is a sibling of bot: " + bot.isSibling( HEADINGTWO ) );
// console.info( HEADINGTHREE.target.tagName + " is a sibling of bot: " + bot.isSibling( HEADINGTHREE.target ) );
// console.info( "children: " + bot.children );
// console.info( HEADINGTWO.tagName + " is a child of bot: " + bot.isChild( HEADINGTWO ) );
// console.info( HEADINGTHREE.target.tagName + " is a child of bot: " + bot.isChild( HEADINGTHREE.target ) );
// console.info( "old attributes: " + bot.attributes );
// bot.attributes = { id: "bot" };
// console.info( "new attributes: " + bot.attributes );
