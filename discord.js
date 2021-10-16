function rgbToHex( r, g, b ) {
    r = Number( r );
    g = Number( g );
    b = Number( b );

    return "#" + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
}

//

var prefix = "!"
var cmds = {
    "help": {
        args: "",
        desc: "Вывести доступные команды бота `uTool`",
        func: function( message, args ) {
            var txt = ""

            for( let key of Object.keys( cmds ) ) {
                var dat = cmds[ key ];

                txt += `\`${ prefix }${ key }${ dat.args != "" ? " " + dat.args : "" }\` - ${ dat.desc }\n`
            };
            
            var msg = new discord.MessageEmbed()
                .setColor( "#32a852" )
                .setTitle( "Доступные команды" )
                .setDescription( txt )

            message.reply( msg );
        }
    },

    "db": {
        args: "STEAMID/STEAMID64/PROFILE-URL",
        desc: "Узнать информацию об пользователе, который играл на сервере",
        func: function( message, args ) {
            if ( !args[1] ) {
                message.reply( "Не указан аргумент: `steami/steamid64/profile-url`" );
                
                return
            };

            var options = {
                host: "gmodugolochek.ru",
                path: "/playerinfo?s=" + args[1],

                method: "GET"
            };

            http.request( options, function( res ) {
                var str = ""

                res.on( "data", function( chunk ) {
                    if ( message ) {
                        str += chunk
                        
                        var msg

                        //

                        switch( str ) {
                            case "error":
                                msg = "Ошибка: `Неверно введены `"
                            break

                            case "nil":
                                msg = "Ошибка: `Игрока нету в базе данных`"
                            break

                            default:
                                var dat = JSON.parse( str );
                                var time = new Date( Number( dat.lastvisit ) * 1000 )
                                var col = dat.color.split( "," );
                                
                                msg = new discord.MessageEmbed()
                                    .setColor( rgbToHex( col[0], col[1], col[2] ) )
                                    .setAuthor( dat.name, dat.avatar, "https://gmodugolochek.ru/steamid?=" + dat.steamid )
                                    .setDescription( `Ник: \`${ dat.name }\`\nГруппа: \`${ dat.team }\`\n
                                        Последний заход: \`${ time.getHours() }:${ time.getMinutes() }:${ time.getSeconds() } ${ time.getDay() }/${ time.getMonth() + 1 }/${ time.getFullYear() } МСК\`` )

                                if ( dat.ban ) {
                                    var time_banned = new Date( Number( dat.ban.time ) * 1000 )
                                    var time_unban = new Date( Number( dat.ban.unban ) * 1000 )

                                    var banned = `Очень давно`
                                    var unban = `Никогда`

                                    if ( dat.ban.unban != "0" ) {
                                        unban = `${ time_unban.getHours() }:${ time_unban.getMinutes() }:${ time_unban.getSeconds() } ${ time_unban.getDay() }/${ time_unban.getMonth() + 1 }/${ time_unban.getFullYear() }`
                                    }

                                    if ( time_banned != 0 ) {
                                        banned = `${ time_banned.getHours() }:${ time_banned.getMinutes() }:${ time_banned.getSeconds() } ${ time_banned.getDay() }/${ time_banned.getMonth() + 1 }/${ time_banned.getFullYear() } МСК`
                                    }

                                    var ban = new discord.MessageEmbed()
                                        .setColor( "#eb4037" )
                                        .setTitle( `${ dat.name } - Игрок в бане` )
                                        .setDescription( `Причина: \`${ dat.ban.reason }\`\nАдминистратор: \`${ dat.ban.admin }\`\n
                                            Разбан: \`${ unban } МСК\`\nДата получения бана: \`${ banned }\`` )


                                    setTimeout( function() { 
                                        message.reply( ban );
                                    }, 50 )
                                };
                            break
                        }

                        //
                
                        message.reply( msg ); // TODO: изменить на message.channel.send, сейчас он не работает???
                    };
                });
            } ).end();
        },
    },
};

//

let client = new discord.Client( { 
    restTimeOffset: 150,
    messageCacheMaxSize: 100,
} )

client.on( "message", message => {
    if ( message.author.bot ) { return };

    var args = message.content.split( " " );
    var cmd = args[0].split( prefix )[1];
    
    //if ( args[ 0 ].split( "" ) != prefix ) { return };
    if ( !cmds[ cmd ] ) { return };

    cmds[ cmd ].func( message, args );
});

client.on( "ready", () => {
    console.log( `Logged in as ${ client.user.tag }` );

    client.user.setActivity( prefix + "help", { 
        name: "Уголочек",
        url: "https://gmodugolochek.ru",
        type: "LISTENING",
    } )
} );

client.login( process.env.DISCORD_TOKEN );