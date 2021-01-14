import index from './index.js'

export default function DOMbot(value = undefined) {
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
