"use strict";

import factory from "./DOMbot.js"

factory( {
  name: "search",
  data: ( () => Array
    .from( document.querySelectorAll("ol#results > li") ).map( ( node ) => ( {
      url: node.querySelector("a").getAttribute("href"),
      name: node.querySelector("h4").textContent,
      datetime: node.querySelector("time").getAttribute("datetime"),
      description: node.querySelector("p").textContent
    } ) )
  )(),
  variables: {
    start: 0,
    delta: 10,
    entries: 0,
    keywords: [],
    sorted: []
  },
  dataProcessing: {
    // returns an array of reordered `data` by `sorted` or undefined if either array is empty
    name: "extract",
    action: () => {
      return Array
        .from( variables.sorted, ( key ) => data[key] )
        .slice( variables.start, variables.start + variables.delta );
    }
  },
  variableInterface: [
    { // start
      variable: "start",
      action: ( value ) => {
        variables.start = value < 0 ? 0 : ( value > variables.entries ? variables.start : value );
        sendCommand( [ { bot: "results", command: data.extract }, "next", "previous" ] );
      }
    },
    { // delta
      variable: "delta"
    },
    { // entries
      variable: "entries"
    },
    { // keywords
      variable: "keywords",
      action: ( value ) => {
        // speed function
        let timestamp = Date.now();

        // attempt to search for keywords
        try { // check for valid keywords
          if ( value !== "" ) {
            variables.keywords = typeof value === "string" ? value.split(" ") : [`${value}`];
          } else {
            throw 0;
          }

          // score article relevance
          const scoredArray = data.map( ( { name: name, description: description } ) => {
            // reset score to 0
            let score = 0;

            // iterate through keywords
            variables.keywords.forEach( ( keyword ) => {
              let index = 0;
              while (true) {
                index = description.toLowerCase().indexOf( keyword, index );
                if ( index >= 0 ) {
                  score += 1;
                  index += 1;
                } else break;
              }
              score += name.toLowerCase().includes( keyword ) ? 2 : 0;
            } ) // end keywords iterations

            // return score
            return score;
          } ); // end array.map() iterations

          variables.sorted = Array.from( scoredArray.keys() ).filter( (a) => scoredArray[a] > 0 ).sort( ( b, c ) => scoredArray[c] - scoredArray[b] );
        } catch { // set default ordering
          variables.sorted = Array.from( data.keys() );
        } finally { // display results
          // update private variables
          variables.start = 0;
          variables.entries = variables.sorted.length;

          sendCommand( [ { bot: "speed", command: Date.now() - timestamp  }, { bot: "results", command: data.extract }, "next", "previous" ] );
        }
      }
    }
  ],
  bot: [
    { // anonymous DOMbot actions
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
           `<form id="search">
              <input id="searchBar" type="text" placeholder="Search for keywords..."></input>
              <input type="submit" value="Search"></input>
            </form>`
          ),
        ( relayMessage ) => document.querySelector( `#search` ).addEventListener( "submit", ( event ) => {
          event.preventDefault();
          relayMessage( "keywords", document.querySelector( `#search > input[type=text]` ).value.toLowerCase() );
        } )
      ]
    },
    { // #speed
      id: "speed",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
          `<p id="speed" style="visibility: hidden;">0 records found in 0 milliseconds</p>`
        ),
        ( value ) => {
          if ( value !== undefined ) {
            if ( id.hasAttribute( "style" ) ) {
              id.removeAttribute( "style" );
            }
            id.innerHTML = `${mothership.entries} records found in ${value} millisecond${value !== 1 ? "s" : ""}`;
          }
        }
      ],
    },
    { // #results
      id: document.querySelector( "ol#results" ),
      action: ( value ) => {
        if ( Array.isArray( value ) ) {
           // clear currently displayed results
          results.innerHTML = "";
          // destructure `article` object properties into variables
          value.forEach( ( { url: url, name: name, datetime: datetime, description: description } ) => {
            // insert `article` tilecard
            id.insertAdjacentHTML( 'beforeend',
              `<li>
                <a href="${url}">
                  <article>
                    <h4>${name}</h4>
                    <time datetime="${datetime}">${
                      // construct proper datetime display
                      new Date( datetime ).toLocaleDateString( "en-US", {
                        year:  'numeric',
                        month: 'long',
                        day:   'numeric'
                      } )
                    }</time>
                    <hr>
                    <p>${description}</p>
                  </article>
                </a>
              </li>`
            );
          } )
        }
      },
    },
    { // #next
      id: "next",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "afterend",
           `<a id="next" class="insertPagination" style="display: none;" href="javascript:void(0)">Next</a>`
        ),
        () => id.addEventListener( "click", ( click ) => {
            event.preventDefault();
            relayMessage( "start", mothership.start + mothership.delta );
          } ),
        () => {
          id.setAttribute( "style", mothership.start + mothership.delta < mothership.entries ? "" : "visibility: hidden;" );
        }
      ],
    },
    { // #previous
      id: "previous",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "afterend",
           `<a id="previous" class="insertPagination" style="display: none;" href="javascript:void(0)">Prev</a>`
        ),
        () => id.addEventListener( "click", ( click ) => {
            event.preventDefault();
            relayMessage( "start", mothership.start - mothership.delta );
          } ),
        () => {
          id.setAttribute( "style", mothership.start > 0 ? "" : "visibility: hidden;" );
        }
      ]
    }
  ] // end of bots
} );
