"use strict";

// import functions
import createElement from "./createElement.js";

export default function slot( element ) {
  return createElement({
    slot: {
      name: element
    }
  });
}
