"use strict";

/*
  because firefox encodes `file:///*` as unique, cross-origin policy kicks in
  to fix, navigate to:
    firefox -> about:config -> privacy.file_unique_origin = false
*/

import DOMbot from "./DOMbot.js"
import index  from "./index.js";


// Search constructor
function Search( secret = undefined ) {
  // key for Search and DOMbot to talk to each other
  const _secret = secret;

  // define private variables
  var _delta    = 10;
  var _entries  =  0;
  var _keywords = [];
  var _start    =  0;

  var _relSorted = [];

  // define public interface
  Object.defineProperties( this, {
    delta: {
      get: () => _delta,
      // if value is 0 or negative, assign 1
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        if ( _entries > 0 ) {
          _delta = value < 1 ? 1 : ( value > _entries ? _entries : value );
          Refresh();
        }
      }
    },
    entries: {
      get: () => _entries,
      set: ( undefined ) => console.info( "cannot set the value of `entries`" )
    },
    keywords: {
      get: () => _keywords,
      set: ( value ) => {
        // data validation for keyword input
        _keywords =   typeof value === typeof [] ? value              // if array, return array
                  : ( typeof value === typeof "" ? value.split(" ")   // if string, return array of substrings
                  : [ "" + value ] );                                 // otherwise, return array of stringified value

        // speed function
        let timestamp = Date.now();

        // declare private to `this.keywords`
        let _relScores = [];
        let _relToSort = [];

        // iterate through index
        for ( let i = 0, len = index.length; i < len; i++ ) {
          let n = 0;
          let indexItem             = index[i];
              indexItem.name        = indexItem.name.toLowerCase();
              indexItem.description = indexItem.description.toLowerCase();

          // iterate through _keywords
          for ( let j = _keywords.length - 1; j >= 0; j-- ) {
            let k = 0;
            while (true) {
              k = indexItem.description.indexOf( _keywords[j], k );
              if (k >= 0) {
                n++;
                k++;
              } else break;
            }
            n += indexItem.name.includes(     _keywords[j] ) ? 2 : 0;
            n += indexItem.keywords.includes( _keywords[j] ) ? 2 : 0;
          } // end _keywords iterations

          _relScores.push( n );
          _relToSort.push( i );
        } // end index iterations


        // return filtered and sorted array
        _relSorted = _relToSort.filter( (a) => _relScores[a] > 0 ).sort( ( b, c ) => _relScores[c] - _relScores[b] );

        // update private variables
        _entries = _relSorted.length;
        _start   = 0;

        speed_BOT.id = { secret : _secret, data : Date.now() - timestamp };

        Refresh();
      }
    },
    start: {
      get: () => _start,
      // if value is negative, assign 0
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        _start = value < 0 ? 0 : ( value > _entries ? _start : value );
        Refresh();
      }
    }
  } );

  let Refresh = () => {
    results_BOT.id = { secret : _secret, data : (() => {
        let _section = _relSorted.slice( _start, _start + _delta );
        let _tmparr = [];
        for ( let i = 0, len = _delta; i < len; i++ ) {
          _tmparr.push( index[ _section[i] ] );
        }
        return _tmparr;
      })() };
    previous_BOT.id = { secret : _secret, data : undefined };
    next_BOT.id = { secret : _secret, data : undefined };
  }

  // go back a page
  this.Decrement = () => this.start -= _delta; // references properties instead of private lets to utilize get:set:

  // go forward a page
  this.Increment = () => this.start += _delta; // references properties instead of private lets to utilize get:set:

  // insulate object from defineProperty manipulations
  Object.seal(this);
}

// blueprints for DOMbot
const blueprints = [
  { // #search
    id: "search",
    Insert: {
      nearbyId: "#results",
      position: "beforebegin",
      text:
       `<form id="search">
          <link rel="stylesheet" href="../css/navigation.css">
          <input type="text" placeholder="Search for keywords..."><input type="submit" value="Search"></input></input>
        </form>`
    },
    Event: {
      type: "submit",
      Listener: () => search.keywords = document.querySelector( `#search > input[type=text]` ).value.toLowerCase()
    },
    Action: undefined
  },
  { // #speed
    id: "speed",
    Insert: {
      nearbyId: "#results",
      position: "beforebegin",
      text: `<p id="speed" style="visibility: hidden;">0 records found in 0 milliseconds</p>`
    },
    Event: undefined,
    Action: ( data = undefined ) => {
      document.getElementById( "speed" ).setAttribute( "style", "" );
      document.getElementById( "speed" ).innerHTML = `${search.entries} records found in ${data} milliseconds`;
    }
  },
  { // #next
    id: "next",
    Insert: {
      nearbyId: "#results",
      position: "afterend",
      text: `<a id="next" class="insertPagination" style="display: none;" href="javascript:void(0)">Next</a>`
    },
    Event: {
      type: "click",
      Listener: () => search.Increment()
    },
    Action: ( data = undefined ) => {
      document.querySelector( "#next" ).setAttribute( "style", search.start + search.delta < search.entries ? "" : "visibility: hidden;" );
    }
  },
  { // #previous
    id: "previous",
    Insert: {
      nearbyId: "#results",
      position: "afterend",
      text: `<a id="previous" class="insertPagination" style="display: none;" href="javascript:void(0)">Prev</a>`
    },
    Event: {
      type: "click",
      Listener: () => search.Decrement()
    },
    Action: ( data = undefined ) => {
      document.querySelector( "#previous" ).setAttribute( "style", search.start > 0 ? "" : "visibility: hidden;" );
    }
  },
  { // #results
    id: "results",
    Insert: undefined,
    Event: undefined,
    Action: ( data = undefined ) => {
      document.querySelector( "#results" ).innerHTML = "";
      const MONTHS = [ "",
                       "January",
                       "February",
                       "March",
                       "April",
                       "May",
                       "June",
                       "July",
                       "August",
                       "September",
                       "October",
                       "November",
                       "December" ];
      for ( let i = 0, len = data.length; i < len; i++ ) {
        const LISTITEM = data[i];
        if ( LISTITEM === undefined ) { break } else {
        document.querySelector( "#results" ).insertAdjacentHTML( 'beforeend',
          `<li>
            <a href="${LISTITEM.url}">
              <article>
                <h4>${LISTITEM.name}</h4><time
          datetime="${LISTITEM.datetime}">
            ${MONTHS[ LISTITEM.datetime.substring( 5,  7 ) ]}
                    ${LISTITEM.datetime.substring( 8, 10 )},
                    ${LISTITEM.datetime.substring( 0,  4 )}</time>
                <hr>
                <p>${LISTITEM.description}</p>
              </article>
            </a>
          </li>`
        ); }
      }
    }
  }
];

// instantiate Search and DOMbot
( ( Con, blueprints ) => {
    let secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );

    for ( let i = 0, len = blueprints.length; i < len; i++ ) {
      window[`${blueprints[i].id}_BOT`] = new DOMbot( blueprints[i], secret );
    }

    window[Con[0]] = new Con[1]( secret );

    secret = undefined;
  }
)( [ "search", Search ], blueprints );
