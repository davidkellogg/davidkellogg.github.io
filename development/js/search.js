"use strict";

// import functions
import factory from "./DOMbot.js"

// blueprints
const blueprints = {
  name: "search",
  data: ( () => {
    let dataConstruct = [];
    document.querySelectorAll("li").forEach( ( node ) => dataConstruct.push( {
      url: node.querySelector("a").getAttribute("href"),
      name: node.querySelector("h4").textContent,
      datetime: node.querySelector("time").getAttribute("datetime"),
      description: node.querySelector("p").textContent
    } ) );
    return dataConstruct;
  } )(),
  variables: {
    start: 0,
    delta: 10,
    entries: 0,
    keywords: [],
    sorted: []
  },
  validations: [
    { // start
      varIndex: "start",
      action: ( value, sendCommand ) => {
        blueprints.variables.start = value < 0 ? 0 : ( value > blueprints.variables.entries ? blueprints.variables.start : value );
        sendCommand( [ { bot: blueprints.bots[2].id, data: blueprints.data.extract },
                              blueprints.bots[3].id,
                              blueprints.bots[4].id ] );
      }
    },
    { // delta
      varIndex: "delta"
    },
    { // entries
      varIndex: "entries"
    },
    { // keywords
      varIndex: "keywords",
      action: ( value, sendCommand ) => {
        // speed function
        let timestamp = Date.now();

        // attempt to search for keywords
        try { // check for valid keywords
          if ( value !== "" ) {
            blueprints.variables.keywords = typeof value === "string" ? value.split(" ") : [`${value}`];
          } else {
            throw 0;
          }

          // score article relevance
          const scoredArray = blueprints.data.map( ( { name: name, description: description } ) => {
            // reset score to 0
            let score = 0;

            // iterate through keywords
            blueprints.variables.keywords.forEach( ( keyword ) => {
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

          blueprints.variables.sorted = Array.from( scoredArray.keys() ).filter( (a) => scoredArray[a] > 0 ).sort( ( b, c ) => scoredArray[c] - scoredArray[b] );
        } catch { // set default ordering
          blueprints.variables.sorted = Array.from( blueprints.data.keys() );
        } finally { // display results
          // update private variables
          blueprints.variables.start = 0;
          blueprints.variables.entries = blueprints.variables.sorted.length;

          sendCommand( [ { bot: blueprints.bots[1].id, data: Date.now() - timestamp  },
                         { bot: blueprints.bots[2].id, data: blueprints.data.extract },
                                blueprints.bots[3].id,
                                blueprints.bots[4].id ] );
        }
      }
    }
  ],
  bots: [
    { // #search
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
           `<form id="search">
              <input id="searchBar" type="text" placeholder="Search for keywords..."></input>
              <input type="submit" value="Search"></input>
            </form>`
          ),
        ( relayMessage ) => document.querySelector( `#search` ).addEventListener( "submit", ( event ) => {
          event.preventDefault();
          relayMessage( blueprints.validations[3].varIndex, document.querySelector( `#search > input[type=text]` ).value.toLowerCase() );
        } )
      ]
    },
    { // #speed
      id: "speed",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
          `<p id="speed" style="visibility: hidden;">0 records found in 0 milliseconds</p>`
        ),
        ( { id: id, data: data, mothership: mothership } ) => {
          if ( data !== undefined ) {
            if ( id.hasAttribute( "style" ) ) {
              id.removeAttribute( "style" );
            }
            id.innerHTML = `${mothership.entries} records found in ${data} millisecond${data !== 1 ? "s" : ""}`;
          }
        }
      ],
    },
    { // #results
      id: document.querySelector( "ol#results" ),
      action: ( { id: id, data: data } ) => {
        if ( data !== undefined ) {
           // clear currently displayed results
          results.innerHTML = "";
          // destructure `article` object properties into variables
          data.forEach( ( { url: url, name: name, datetime: datetime, description: description } ) => {
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
        ( { id: id, mothership: mothership, relayMessage: relayMessage } ) => id.addEventListener( "click", ( click ) => {
            event.preventDefault();
            relayMessage( blueprints.validations[0].varIndex, mothership.start + mothership.delta );
          } ),
        ( { id: id, mothership: mothership } ) => {
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
        ( { id: id, mothership: mothership, relayMessage: relayMessage } ) => id.addEventListener( "click", ( click ) => {
            event.preventDefault();
            relayMessage( blueprints.validations[0].varIndex, mothership.start - mothership.delta );
          } ),
        ( { id: id, mothership: mothership } ) => {
          id.setAttribute( "style", mothership.start > 0 ? "" : "visibility: hidden;" );
        }
      ],
    }
  ]
};

// returns the reordered `array` by `keys` or undefined if either array is empty
Object.defineProperty( blueprints.data, "extract", {
  get: () => Array
    .from( blueprints.variables.sorted, ( key ) => blueprints.data[key] )
    .slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta )
} );

// instantiate Mothership and DOMbots
factory( blueprints );
