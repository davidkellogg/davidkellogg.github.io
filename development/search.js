"use strict";

// DOMbot Constructor
function DOMbot() {

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

  let _sortRelevance = [];

  // declare public interface
  Object.defineProperties( this, {
    sortRelevance: {
      get: () => undefined,
      set: ( value ) => _sortRelevance = value
    }
  } );

  // insert beginning InsertJSElements
  this.InsertJSElements = () => {

    // insert navigation.css
    document.querySelector( "head" ).insertAdjacentHTML( 'beforeend', '<link rel="stylesheet" href="navigation.css">' );

    // insert search box
    RESULTLIST.insertAdjacentHTML( 'beforebegin', '\
      <form id="search">\
        <input type="text" id="keywords" placeholder="Search for keywords..."></input><input type="submit" value="Search"></input>\
      </form>\
    '); // onsubmit="search.Query" is broken. Looking for function call

    // insert navigation items
    RESULTLIST.insertAdjacentHTML( 'afterend', '\
      <a id="prev" class="insertPagination" style="display: none;" href="javascript:void(0)">Prev</a>\
      <a id="next" class="insertPagination" style="display: none;" href="#">Next</a>\
    ');

    // preventDefault
    document.querySelector( "#search" ).addEventListener( 'submit',  ( event ) => {
      event.preventDefault();
      search.Query();
    } );
    document.querySelector( "#prev" ).addEventListener( 'click', ( event ) => {
      event.preventDefault();
      search.Decrement();
      } ); // ch: preventDefault() not working
    document.querySelector( "#next" ).addEventListener( 'click', function( event ) {
      event.preventDefault();
      search.Increment();
    } );
  }

  // display page
  this.Refresh = () => {
    // change behavior of next and prev links
    // prev link behavior
    document.querySelector( "#prev" ).setAttribute( "style", search.startQuery > 0 ? "" : "visibility: hidden;" );

    // next link behavior
    document.querySelector( "#next" ).setAttribute( "style", search.startQuery + search.searchDelta < search.entries ? "" : "visibility: hidden;" );

    // construct Query results
    RESULTLIST.innerHTML = "";
    for ( let i = search.startQuery, len = search.startQuery + search.searchDelta; i < len; i++ ) {
      const LISTITEM  = index[ _sortRelevance[i] ];
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

  /* // display speed
  <p id="querySpeed" style="visibility: hidden;">0 records found in 0 milliseconds</p>

  let timestamp = Date.now();
  document.getElementById( "querySpeed" ).setAttribute( "style", "" );
  document.getElementById( "querySpeed" ).innerHTML =
    `${_entries} records found in ${( timestamp - Date.now() ) * -1} milliseconds`;
  this.Display()
  */

  Object.seal(this);
}
var searchElementsBOT = new DOMbot();

searchElementsBOT.InsertJSElements();


// Search Constructor
function Search() {
  // private declarations
  const that = this;

  let _entries       =  0;
  let _keywords      = []; // create public interface for this
  let _searchDelta   = 10;
  let _sortRelevance = [];
  let _startQuery    =  0;

  // define public interface
  Object.defineProperties( this, {
    entries: {
      get: () => _entries,
      // set `entries` as read only
      set: () => console.info( "cannot write to `entries`" )
    },
    keywords: {
      get: () => _keywords,
      set: ( value ) => {
        _keywords = value; // add string-to-array typesetting
        searchElementsBOT.Refresh()
      }
    },
    searchDelta: {
      get: () => _searchDelta,
      // if value is 0 or negative, assign 1
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        _searchDelta = value < 1 ? 1 : ( value > _entries ? _entries : value );
        searchElementsBOT.Refresh();
      }
    },
    sortRelevance: { // interface to transmit data to searchElementsBOT
      get: () => {},
      set: ( value ) => {
        _entries = value.length;
        searchElementsBOT.sortRelevance = value;
      }
    },
    startQuery: {
      get: () => _startQuery,
      // if value is negative, assign 0
      // if value exceeds the number of entries, assign original value
      // otherwise, assign value
      set: ( value ) => {
        _startQuery = value < 0 ? 0 : ( value > _entries ? _startQuery : value );
        searchElementsBOT.Refresh()
      }
    }
  } );

  // construct the query results
  this.Query = () => {

    // reset defaults
    _startQuery = 0;
    //_sortRelevance = [];
    _keywords = [];

    // search for keywords
    _keywords.push( document.querySelector("#keywords").value.toLowerCase() );

    // declare private variables
    let _relevance     = [];
    let _descRelevance = [];
    let _len           = _keywords.length;

    // iterate through index
    for ( let i = 0, len = index.length; i < len; i++ ) {
      let n = 0;
      let indexItem             = index[i];
          indexItem.name        = indexItem.name.toLowerCase();
          indexItem.description = indexItem.description.toLowerCase();

      // iterate through _keywords
      for ( let j = _len - 1; j >= 0; j-- ) {
        let k = 0;
        while (true) {
          k = indexItem.description.indexOf( _keywords[j], k );
          if (k >= 0) {
            n++;
            k++;
          } else break;
        }
        n += indexItem.name.includes(     _keywords[j] ) ? 2 : 0;
        n += indexItem.url.includes(      _keywords[j] ) ? 2 : 0;
        n += indexItem.keywords.includes( _keywords[j] ) ? 2 : 0;
      } // end _keywords iterations

      _relevance.push( n );
      _descRelevance[i] = i;
    } // end index iterations

    // return filtered and sorted array
    this.sortRelevance = _descRelevance.filter( (a) => _relevance[a] > 0 ).sort( ( b, c ) => _relevance[c] - _relevance[b] );

    // display speed
    searchElementsBOT.Refresh();
  }

  // go back a page
  this.Decrement = () => that.startQuery -= _searchDelta; // references properties instead of private lets to utilize get:set:

  // go forward a page
  this.Increment = () => that.startQuery += _searchDelta; // references properties instead of private lets to utilize get:set:

  Object.seal(this);
}
var search = new Search();
