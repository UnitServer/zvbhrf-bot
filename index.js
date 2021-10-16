global.express = require( "express" );
global.app = express();

global.request = require( "request" );
global.http = require( "http" );
global.discord = require( "discord.js" );

/////

var port = process.env.PORT || "8080"
let httpServer = http.createServer( app );

const static = require( "node-static" );
const fileServer = new static.Server( "./app" );
app.use( ( req, res ) => fileServer.serve(req, res) );

httpServer.listen( port );

process.on( "uncaughtException", function( err ){ console.error( err ) } );

if ( process.env.PORT ) { 
    setInterval( function() { request( "https://zvbhrf.herokuapp.com/" ) }, 300000 );
};

/////

require( "./discord.js" );
require( "./functions.js" )

/////

console.log( "Succesfuly loaded -> index.js" );