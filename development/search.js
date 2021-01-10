/*     TO ADD
 *
 * [ ] Add multiple keyword search
 * [X] Add secondary search (recent, oldest)
 * [X] Add empty keyword search returns to default
 *
 * noscript fallback in dev.html
 * add { display: block; } to JS dependent elemtents? form#searchForm, p#querySpeed, a#prev, a#next
 *
 */

// global variables
var           startQuery =  0;
var             endQuery = 10;
var       relevanceArray = [];
var sortedRelevanceArray = [];
var      relevantEntries = 0;

/* <link rel="stylesheet" href="development.css"> */
document.querySelector("head").insertAdjacentHTML( 'beforeend', '<link rel="stylesheet" href="navigation.css">' );


// insert navigation items
document.getElementById( "resultList" ).insertAdjacentHTML( 'beforebegin', '\
  <form id="searchForm" onsubmit="QueryIndex()">\
    <input type="text" id="search" placeholder="Search for keywords..."></input><input type="submit" value="Search"></input>\
  </form>\
  <p id="querySpeed" style="visibility: hidden;">0 records found in 0 milliseconds</p>\
');

document.getElementById( "resultList" ).insertAdjacentHTML( 'afterend', '\
  <a id="prev" class="displayPageNavigation" style="display: none;" href="javascript:PrevPage()">Prev</a>\
  <a id="next" class="displayPageNavigation" style="display: none;" href="javascript:NextPage()">Next</a>\
');

// preventDefault
document.getElementById( "searchForm" ).addEventListener( 'submit',  ( event ) => event.preventDefault() );
document.getElementById( "prev"       ).addEventListener( 'onclick', ( event ) => event.preventDefault() );
document.getElementById( "next"       ).addEventListener( 'onclick', ( event ) => event.preventDefault() );

// display page
function DisplayPage() {
  document.getElementById("resultList").innerHTML = "";

  // change behavior of next and prev links
  // prev link behavior
  document.getElementById( "prev" ).setAttribute( "style", startQuery > 0 ? "" : "visibility: hidden;" )

  // next link behavior
  document.getElementById( "next" ).setAttribute( "style", endQuery < relevantEntries ? "" : "visibility: hidden;" )

  // construct Query results
  const QUERYLIST = document.getElementById( "resultList" );
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
  for ( let i = startQuery, len = Math.min( relevantEntries, endQuery ); i < len; i++ ) {
    const LISTITEM  = index[ sortedRelevanceArray[i] ];
    QUERYLIST.innerHTML +=
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
      </li>`;
  }
}

// go back a page
function PrevPage() {
  if ( relevantEntries > 0 ) {
        endQuery = Math.max(   endQuery -= Math.min( endQuery - startQuery, 10 ), 10 );
      startQuery = Math.max( startQuery -= 10,  0 );
    DisplayPage();
  }
}

// go forward a page
function NextPage() {
  if ( relevantEntries > 0 ) {
    startQuery = Math.min( startQuery += 10, relevantEntries - ( relevantEntries % 10 ) );
      endQuery = Math.min(   endQuery += 10, relevantEntries );
    DisplayPage();
  }
}

// construct the query results
function QueryIndex() {
  // reset variables
  const      timestamp = Date.now();
            startQuery =  0;
              endQuery = 10;
        relevanceArray = [];
  sortedRelevanceArray = [];

  //
  if ( document.getElementById("search").value == "" ) {
    for ( i = 0, len = index.length; i < len; i++ ) { relevanceArray.push( index[i].datetime ); }
    sortedRelevanceArray =  Array.from( Array(  relevanceArray.length ).keys() ).sort(
                ( a, b ) => relevanceArray[a] > relevanceArray[b] ? -1 :
                          ( relevanceArray[b] > relevanceArray[a] ) | 0 );
  } else {
    // construct relevanceArray
    for ( i = 0, len = index.length; i < len; i++ ) {
      const searchItem = index[i];
      searchItem.relevance = 0;
      const CURRENTKEYWORD = document.getElementById("search").value.toLowerCase();

      // evaluate name
      searchItem.relevance += searchItem.name.toLowerCase().includes(CURRENTKEYWORD) ? 2 : 0;

      // evaluate url
      searchItem.relevance += searchItem.url.toLowerCase().includes(CURRENTKEYWORD) ? 2 : 0;

      // evaluate keywords
      searchItem.relevance += searchItem.keywords.includes(CURRENTKEYWORD) ? 2 : 0;

      // evaluate description
      searchItem.relevance += searchItem.description.toLowerCase().includes(CURRENTKEYWORD)
                          ? ( searchItem.description.toLowerCase().match( new RegExp( CURRENTKEYWORD,'gi' ) ) || [] ).length
                          : 0;

      relevanceArray.push( searchItem.relevance );
    }

    // sort relevanceArray into sortedRelevanceArray
    sortedRelevanceArray = function() {
      let tmpArr = [];
      for ( let i = 0, len = relevanceArray.length; i < len; i++ ) {
        if ( relevanceArray[i] != 0 ) { tmpArr.push(i) };
      }
      return tmpArr;
    }().sort( ( a, b ) => relevanceArray[a] > relevanceArray[b] ? -1 :
                        ( relevanceArray[b] > relevanceArray[a] ) | 0 );
  }

  relevantEntries = sortedRelevanceArray.length;

  // display search results by sortedRelevanceArray
  DisplayPage();
  document.getElementById( "querySpeed" ).setAttribute( "style", "" );
  document.getElementById( "querySpeed" ).innerHTML =
    `${relevantEntries} records found in ${( timestamp - Date.now() ) * -1} milliseconds`;
  console.log(`${relevantEntries} records found in ${( timestamp - Date.now() ) * -1} milliseconds`);
}
