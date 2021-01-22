"use strict";

/*
  because firefox encodes `file:///*` as unique, cross-origin policy kicks in
  to fix, navigate to:
    firefox -> about:config -> privacy.file_unique_origin = false
*/

// import functions
import { SendCommand, Factory } from "./DOMbot.js"

// returns the reordered `array` by `keys` or undefined if either array is empty
const Reorder = ( array, keys ) => Array.from( keys, ( key ) => array[key] );

// blueprints
const blueprints = {
  name : "search",
  data : ( () => {
    const li = document.querySelectorAll("li");
    let tmpIndex = [];
    for ( let i = 0, len = li.length; i < len; i++) {
      let data = {
        url: li[i].querySelector("a").getAttribute("href"),
        name: li[i].querySelector("h4").textContent,
        datetime: li[i].querySelector("time").getAttribute("datetime"),
        description: li[i].querySelector("p").textContent
      }
      tmpIndex.push( data );
    }
    return tmpIndex;
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
      action : ( value ) => {
        blueprints.variables.start = value < 0 ? 0 : ( value > blueprints.variables.entries ? blueprints.variables.start : value );
        SendCommand( results_BOT,  Reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
        SendCommand( previous_BOT, undefined );
        SendCommand( next_BOT,     undefined );
      }
    },
    { // delta
      varIndex : "delta",
      action : ( value ) => {
        if ( blueprints.variables.entries > 0 ) {
          blueprints.variables.delta = value < 1 ? 1 : ( value > blueprints.variables.entries ? blueprints.variables.entries : value );
          SendCommand( results_BOT,  Reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
          SendCommand( previous_BOT, undefined );
          SendCommand( next_BOT,     undefined );
        }
      }
    },
    { // entries
      varIndex : "entries",
      action : undefined
    },
    { // keywords
      varIndex : "keywords",
      action : ( value ) => {
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
        blueprints.variables.start   = 0;

        // send commands to bots
        SendCommand( speed_BOT,    Date.now() - timestamp );
        SendCommand( results_BOT,  Reorder( blueprints.data, blueprints.variables.sorted ).slice( blueprints.variables.start, blueprints.variables.start + blueprints.variables.delta ) );
        SendCommand( previous_BOT, undefined );
        SendCommand( next_BOT,     undefined );
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
        () => document.querySelector( "#search" ).addEventListener( "submit", ( event ) => {
            event.preventDefault();
            window[blueprints.name].keywords = document.querySelector( `#search > input[type=text]` ).value.toLowerCase();
          }
        )
      ]
    },
    { // #speed
      id: "speed",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "beforebegin",
          `<p id="speed" style="visibility: hidden;">0 records found in 0 milliseconds</p>`
        ),
        ( data = undefined ) => {
          document.querySelector( "#speed" ).setAttribute( "style", "" );
          document.querySelector( "#speed" ).innerHTML = `${window[blueprints.name].entries} records found in ${data} millisecond${data !== 1 ? "s" : ""}`;
        }
      ],
      executeFinal: false
    },
    { // #results
      id: "results",
      action: ( data = undefined ) => {
        const results = document.querySelector( "#results" );
        results.innerHTML = ""; // clear currently displayed results
        if ( data !== undefined ) {
          // destructure `article` object properties into variables
          data.forEach( ( { url: url, name: name, datetime: datetime, description: description } ) => {
            // insert `article` tilecard
            results.insertAdjacentHTML( 'beforeend',
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
      executeFinal: false
    },
    { // #next
      id: "next",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "afterend",
           `<a id="next" class="insertPagination" style="display: none;" href="javascript:void(0)">Next</a>`
        ),
        () => document.querySelector( "#next" ).addEventListener( "click", ( click ) => {
            event.preventDefault();
            window[blueprints.name].start += window[blueprints.name].delta;
          }
        ),
        ( data = undefined ) => {
          document.querySelector( "#next" ).setAttribute( "style", window[blueprints.name].start + window[blueprints.name].delta < window[blueprints.name].entries ? "" : "visibility: hidden;" );
        }
      ],
    },
    { // #previous
      id: "previous",
      action: [
        () => document.querySelector( "#results" ).insertAdjacentHTML( "afterend",
           `<a id="previous" class="insertPagination" style="display: none;" href="javascript:void(0)">Prev</a>`
        ),
        () => document.querySelector( "#previous" ).addEventListener( "click", ( click ) => {
            event.preventDefault();
            window[blueprints.name].start -= window[blueprints.name].delta;
          }
        ),
        ( data = undefined ) => {
          document.querySelector( "#previous" ).setAttribute( "style", window[blueprints.name].start > 0 ? "" : "visibility: hidden;" );
        }
      ],
    }
  ]
};

// instantiate Mothership and DOMbots
Factory( blueprints );
