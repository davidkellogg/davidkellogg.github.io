/*     TO ADD
 *
 * [ ] Add multiple keyword search
 * [X] Add secondary search (recent, oldest)
 * [X] Add empty keyword search returns to default
 *
 * noscript fallback in dev.html
 */

document.getElementById( "searchForm" ).setAttribute( "style", "" );

// global variables
var           startQuery =  0;
var             endQuery = 10;
var       relevanceArray = [];
var sortedRelevanceArray = [];

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

// preventDefault
document.getElementById( "searchForm" ).addEventListener( 'submit',  ( event ) => event.preventDefault() );
document.getElementById( "prev"       ).addEventListener( 'onclick', ( event ) => event.preventDefault() );
document.getElementById( "next"       ).addEventListener( 'onclick', ( event ) => event.preventDefault() );

// display page
function DisplayPage() {
  document.getElementById("resultList").innerHTML = "";

  // change behavior of next and prev links

  // prev link
  // show
  if ( startQuery >= 10
       && document.getElementById( "prev" ).getAttribute( "href" ) == "" ) {
    document.getElementById( "prev" ).setAttribute( "href", "javascript:PrevPage()" );
    document.getElementById( "prev" ).setAttribute( "style", "" );
  }

  // hide
  if ( startQuery < 10
       && document.getElementById( "prev" ).getAttribute( "href" ) != "" ) {
    document.getElementById( "prev" ).setAttribute( "href", "" );
    document.getElementById( "prev" ).setAttribute( "style", "visibility: hidden;" );
  }

  // next link
  // show
  if ( startQuery < sortedRelevanceArray.length
       && document.getElementById( "next" ).getAttribute( "href" ) == "" ) {
    document.getElementById( "next" ).setAttribute( "href", "javascript:NextPage()" );
    document.getElementById( "next" ).setAttribute( "style", "" );
  }

  // hide
  if ( sortedRelevanceArray.length < endQuery
       && document.getElementById( "next" ).getAttribute( "href" ) != "" ) {
    document.getElementById( "next" ).setAttribute( "href", "" );
    document.getElementById( "next" ).setAttribute( "style", "visibility: hidden;" );
  }

  for ( i = startQuery; i < Math.min( sortedRelevanceArray.length, endQuery ); i++ ) {
    document.getElementById( "resultList" ).innerHTML += `
      <li>
        <a href="${index[ sortedRelevanceArray[i] ].url}">
          <article>
            <h4>${index[ sortedRelevanceArray[i] ].name}</h4><time
      datetime="${index[ sortedRelevanceArray[i] ].datetime}">
        ${MONTHS[ index[ sortedRelevanceArray[i] ].datetime.substring( 5,  7 ) ]}
                ${index[ sortedRelevanceArray[i] ].datetime.substring( 8, 10 )},
                ${index[ sortedRelevanceArray[i] ].datetime.substring( 0,  4 )}</time>
            <hr>
            <p>${index[ sortedRelevanceArray[i] ].description}</p>
          </article>
        </a>
      </li>`;
  }
}

// go back a page
function PrevPage() {
  startQuery = Math.max( startQuery -= 10,  0 );
    endQuery = Math.max(   endQuery -= 10, 10 );
  DisplayPage();
}

// go forward a page
function NextPage() {
  startQuery += 10;
    endQuery += 10;
  DisplayPage();
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
    for ( i = 0; i < index.length; i++ ) {
      relevanceArray.push( index[i].datetime );
    }
    sortedRelevanceArray = Array.from( Array( relevanceArray.length ).keys() ).sort( ( a, b ) => relevanceArray[a] > relevanceArray[b] ? -1 : ( relevanceArray[b] > relevanceArray[a] ) | 0 );
    console.log( sortedRelevanceArray );
  } else {
    // construct relevanceArray
    for (i = 0; i < index.length; i++) {
      index[i].relevance = 0;
      const TMPARR = index[i].keywords;
      const CURRENTKEYWORD = document.getElementById("search").value.toLowerCase();

      // evaluate name
      if ( index[i].name.toLowerCase().includes(CURRENTKEYWORD) ) { index[i].relevance += 2; }

      // evaluate url
      if ( index[i].url.toLowerCase().includes(CURRENTKEYWORD) ) { index[i].relevance += 2; }

      // evaluate keywords
      for ( j = 0; j < TMPARR.length; j++ ) {
        if ( CURRENTKEYWORD === TMPARR[j].toLowerCase() ) {
          index[i].relevance += 2;
        }
      }

      // evaluate description
      if ( index[i].description.toLowerCase().includes( CURRENTKEYWORD ) ) {
        var n = 0, pos = 0;
        while (true) {
          pos = index[i].description.toLowerCase().indexOf( CURRENTKEYWORD, pos );
          if ( pos >= 0 ) {
            n++;
            pos += CURRENTKEYWORD.length;
          } else break;
        }
        index[i].relevance += n;
      }

      relevanceArray.push( index[i].relevance );
    }

    // sort relevanceArray into sortedRelevanceArray
    sortedRelevanceArray = Array.from( Array( relevanceArray.length ).keys() ).sort( ( a, b ) => relevanceArray[a] > relevanceArray[b] ? -1 : ( relevanceArray[b] > relevanceArray[a] ) | 0 );

    // remove irrelevant entries
    while ( relevanceArray[ sortedRelevanceArray[ sortedRelevanceArray.length - 1 ] ] == 0 ) { sortedRelevanceArray.pop(); }
  }

  // display search results by sortedRelevanceArray
  DisplayPage();
  document.getElementById( "querySpeed" ).setAttribute( "style", "" );
  document.getElementById( "querySpeed" ).innerHTML = `${sortedRelevanceArray.length} records found in ${( timestamp - Date.now() ) * -1} milliseconds`;
}
