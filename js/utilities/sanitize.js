export default function sanitize( input ) {
  // Crockford, Douglas. "How JavaScript Works." Virgule Solidus. p 89
  // or page 9.8, by page numeration
  return input
    .replace( /</g,  "&lt;"   )
    .replace( />/g,  "&gt;"   )
    .replace( /&/g,  "&amp;"  )
    .replace( /\\/g, "&bsol;" )
    .replace( /"/g,  "&quot;" );
};
