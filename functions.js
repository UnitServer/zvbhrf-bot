global.randomFromTo = function( min, max ) {
    return Math.random() * ( max - min ) + min;
};

global.rgbToHex = function( r, g, b ) {
    r = Number( r );
    g = Number( g );
    b = Number( b );

    return "#" + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
};

global.clamp = function( num, min, max ) {
    return Math.min( Math.max( num, min ), max );
};