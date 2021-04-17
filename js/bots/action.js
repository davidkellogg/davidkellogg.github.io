"use strict"

import Framework from "./framework.js";

export default class Action extends Framework {
  constructor( element ) {
    super( element );
    let type = undefined;
    let listener = undefined;
    let attributeName = undefined;
    let attributeValue = undefined;

    Object.defineProperties( this, {
      type: {
        get: () => type,
        set: ( value ) => type = `${value}`
      },
      listener: {
        get: () => listener,
        set: ( value ) => {
          if ( typeof value === "function" ) {
            listener = value;
          } else {
            throw new TypeError( typeof value );
          }
        }
      },
      attributeName: {
        get: () => attributeName,
        set: ( value ) => attributeName = `${value}`
      },
      attributeValue: {
        get: () => attributeValue,
        set: ( value ) => attributeValue = value
      }
    });

    Object.freeze( this );
  }

  setType( type ) {
    this.type = type;
    return this;
  }

  setListener( listener ) {
    this.listener = listener;
    return this;
  }

  setAttributeName( attributeName ) {
    this.attributeName = attributeName;
    return this;
  }

  setAttributeValue( attributeValue ) {
    this.attributeValue = attributeValue;
    return this;
  }
}
