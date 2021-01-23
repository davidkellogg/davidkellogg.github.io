"use strict";

/*
  because firefox encodes `file:///*` as unique, cross-origin policy kicks in
  to fix, navigate to:
    firefox -> about:config -> privacy.file_unique_origin = false
*/

// import functions
import Factory from "./DOMbot.js"

// returns the reordered `array` by `keys` or undefined if either array is empty
const reorder = ( array, keys ) => Array.from( keys, ( key ) => array[key] );

// blueprints
const blueprints = {
  name : "search",
  data : ( () => {
    let dataConstruct = [];
    document.querySelectorAll("li").forEach( ( node ) => dataConstruct.push( {
      url: node.querySelector("a").getAttribute("href"),
      name: node.querySelector("h4").textContent,
      datetime: node.querySelector("time").getAttribute("datetime"),
      description: node.querySelector("p").textContent
    } ) );
    return dataConstruct;
  } )(),
  variables : {
    start : 0,
    delta : 10,
    entries : 0,
    keywords : [],
    sorted : []
  },
  validations : [
    { // start
      varIndex : "start",
      action : ( value, sendCommand ) => {
        blueprints.variables.start = value < 0 ? 0 : ( value > blueprints.variables.entries ? blueprints.variables.start : value );
        sendCommand( blueprints.bots[2].id,  reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
        sendCommand( blueprints.bots[4].id );
        sendCommand( blueprints.bots[3].id );
      }
    },
    { // delta
      varIndex : "delta",
      action : ( value, sendCommand ) => {
        if ( blueprints.variables.entries > 0 ) {
          blueprints.variables.delta = value < 1 ? 1 : ( value > blueprints.variables.entries ? blueprints.variables.entries : value );
          sendCommand( blueprints.bots[2].id,  reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
          sendCommand( blueprints.bots[4].id );
          sendCommand( blueprints.bots[3].id );
        }
      }
    },
    { // entries
      varIndex : "entries",
      action : undefined
    },
    { // keywords
      varIndex : "keywords",
      action : ( value, sendCommand ) => {
        // speed function
        let timestamp = Date.now();
        if ( value !== "" ) {
          // data validation for keyword input
          if ( typeof value === "string" ) {
            blueprints.variables.keywords = value.split(" ");
          } else {
            blueprints.variables.keywords = [`${value}`];
          }

          // filter and sort data based on keywords
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
          } ); // end array.map()

          // return filterd and sorted array
          blueprints.variables.sorted = Array.from( scoredArray.keys() ).filter( (a) => scoredArray[a] > 0 ).sort( ( b, c ) => scoredArray[c] - scoredArray[b] );
        } else {
          // reset to original ordering
          blueprints.variables.sorted = Array.from( blueprints.data.keys() );
        }

        // update private variables
        blueprints.variables.entries = blueprints.variables.sorted.length;
        blueprints.variables.start = 0;

        // send commands to bots
        sendCommand( blueprints.bots[1].id, Date.now() - timestamp );
        sendCommand( blueprints.bots[2].id, reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
        sendCommand( blueprints.bots[4].id );
        sendCommand( blueprints.bots[3].id );
      }
    }
  ],
  bots: [
    { // #search
      id: "search",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
           `<form id="search">
              <link rel="stylesheet" href="../css/navigation.css">
              <input id="searchBar" type="text" placeholder="Search for keywords..."></input>
              <input type="submit" value="Search"></input>
            </form>`
          ),
        ( { id: id, relayMessage: relayMessage } ) => id.addEventListener( "submit", ( event ) => {
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
      id: "results",
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
            relayMessage( "start", mothership.start + mothership.delta );
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
            relayMessage( "start", mothership.start - mothership.delta );
          } ),
        ( { id: id, mothership: mothership } ) => {
          id.setAttribute( "style", mothership.start > 0 ? "" : "visibility: hidden;" );
        }
      ],
    }
  ]
};

// instantiate Mothership and DOMbots
Factory( blueprints );
