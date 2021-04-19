"use strict";

const getModule = async function ( path ) {
  const module = await import( path );
  return module.default;
};

// get bot
export const getBot = async function ( bot ) { return getModule( `../bots/${bot}.js` ) };

// get template
export const getTemplate = async function ( template ) { return getModule( `../templates/${template}.js` ) };

// get utility
export const getUtility = async function ( utility ) { return getModule( `./${utility}.js` ) };

export default getModule;
