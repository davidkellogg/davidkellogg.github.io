import DOMbot from './DOMbot.js'
import index from './index.js'

"use strict";

/*
// DOMbot Constructor
function DOMbot(value = undefined) {
  // key for Search and DOMbot to talk to each other
  let _secret = value;

  // declare private variables
  const RESULTLIST = document.querySelector( "#resultList" );
  const MONTHS    = [ "",
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

  let _entries   =  0;
  let _sortedRel = [];
  let _timestamp =  0;

  // declare public interface
  Object.defineProperties( this, {
    entries: {
      get: () => _entries,
      set: ( undefined ) => console.info( "cannot set the value of `entries`" )
    },
    sortRelevance: {
      get: () => console.info( "cannot retrieve the value of `sortRelevance`" ),
      set: ( value ) => {
        if ( value.pop() == _secret ) {
          _timestamp = value.pop();
          _sortedRel = value;
          _entries = _sortedRel.length;
        } else {
          console.info( "cannot set the value of `sortRelevance`" )
        }
      }
    }
  } );

  // insert beginning InsertJSElements
  let InsertJSElements = function() {

    // insert navigation.css
    document.querySelector( "head" ).insertAdjacentHTML( 'beforeend', '<link rel="stylesheet" href="navigation.css">' );

    // insert search box
    RESULTLIST.insertAdjacentHTML( 'beforebegin', '\
      <form id="search">\
        <input type="text" id="keywords" placeholder="Search for keywords..."></input><input type="submit" value="Search"></input>\
      </form>\
      <p id="querySpeed" style="visibility: hidden;">0 records found in 0 milliseconds</p>\
    ');

    // insert navigation items
    RESULTLIST.insertAdjacentHTML( 'afterend', '\
      <a id="prev" class="insertPagination" style="display: none;" href="javascript:void(0)">Prev</a>\
      <a id="next" class="insertPagination" style="display: none;" href="#">Next</a>\
    ');

    // preventDefault
    document.querySelector( "#search" ).addEventListener( 'submit',  ( event ) => {
      event.preventDefault();
      //search.Query();
      search.keywords = document.querySelector("#keywords").value.toLowerCase();
    } );
    document.querySelector( "#prev" ).addEventListener( 'click', ( event ) => {
      event.preventDefault();
      search.Decrement();
      } ); // ch: preventDefault() not working
    document.querySelector( "#next" ).addEventListener( 'click', function( event ) {
      event.preventDefault();
      search.Increment();
    } );
  }();

  // display page
  this.Refresh = () => {
    // change behavior of next and prev links
    // prev link behavior
    document.getElementById( "querySpeed" ).setAttribute( "style", "" );
    document.getElementById( "querySpeed" ).innerHTML =
      `${_entries} records found in ${_timestamp} milliseconds`

    document.querySelector( "#prev" ).setAttribute( "style", search.start > 0 ? "" : "visibility: hidden;" );

    // next link behavior
    document.querySelector( "#next" ).setAttribute( "style", search.start + search.delta < _entries ? "" : "visibility: hidden;" );

    // construct Query results
    RESULTLIST.innerHTML = "";
    for ( let i = search.start, len = search.start + search.delta; i < len; i++ ) {
      const LISTITEM  = index[ _sortedRel[i] ];
      if ( LISTITEM === undefined ) { break } else { // maybe unneccessary error checking?
      RESULTLIST.insertAdjacentHTML( 'beforeend',
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
        );
      }
    }
  }

  Object.seal(this);
}
*/

// Search Constructor
function Search(value = undefined) {
  // key for Search and DOMbot to talk to each other
  let _secret = value;

  // define private variables
  let _entries  =  0;
  let _keywords = [];
  let _delta    = 10;
  let _start    =  0;

  // define public interface
  Object.defineProperties( this, {
    keywords: {
      get: () => _keywords,
      set: ( value ) => {
        let timestamp = Date.now(); //speed function
        _keywords[0] = value;

        // declare private to `this.keywords`
        let _relScores  = [];
        let _relToSort  = [];
        let _relSorted  = [];
            _start =  0;

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
        _entries   = _relSorted.length;

        _relSorted.push( Date.now() - timestamp ); // pass timestamp to DOMbot
        _relSorted.push( _secret );

        search_BOT.sortRelevance = _relSorted;
        search_BOT.Refresh()
      }
    },
    delta: {
      get: () => _delta,
      // if value is 0 or negative, assign 1
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        _delta = value < 1 ? 1 : ( value > _entries ? _entries : value );
        search_BOT.Refresh();
      }
    },
    start: {
      get: () => _start,
      // if value is negative, assign 0
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        _start = value < 0 ? 0 : ( value > _entries ? _start : value );
        search_BOT.Refresh()
      }
    }
  } );

  // go back a page
  this.Decrement = () => this.start -= _delta; // references properties instead of private lets to utilize get:set:

  // go forward a page
  this.Increment = () => this.start += _delta; // references properties instead of private lets to utilize get:set:

  Object.seal(this);
}

// construct Search and DOMbot with channels for communication
(( Con, Bot ) => {
  let secret = Math.floor( ( Math.random() * 100000000 + 10000000 ) );
  window[Con[0]] = new Con[1]( secret );
  window[Bot[0]] = new Bot[1]( secret );
  secret = undefined;
})( [ "search", Search ], [ "search_BOT", DOMbot ] );
