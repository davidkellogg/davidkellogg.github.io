export default function sanitize( input ) {
  return input
    .replace( /</g, "&lt;" )
    .replace( />/g, "&gt;" )
    .replace( /&/g, "&amp;" )
    .replace( /\\/g, "&bsol;" )
    .replace( /"/g, "&quot;" );
};
