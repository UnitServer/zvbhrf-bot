const e = require("express");

function updateActivity() {
    var total = 0

    client.guilds.cache.forEach( function( guild ) {
        total = total + guild.memberCount
    } );

    client.user.setActivity( String( total ) + " members", { 
        type: "LISTENING",
    } );
}

/////

function sendSuccess( desc, message ) {
    var emb = new discord.MessageEmbed()
        .setColor( "#32a852" )
        .setTitle( "Успешно" )
        .setDescription( desc );

    message.channel.send( emb );
};

function sendError( desc, message ) {
    var emb = new discord.MessageEmbed()
        .setColor( "#eb4037" )
        .setTitle( "Ошибка" )
        .setDescription( desc );

    message.channel.send( emb );
};

/////

function userHasRole( message, author, role ) {
    let grole = message.guild.roles.cache.find( r => r.name === role );

    if ( grole ) {
        var dat = author.roles.cache.find( r => r.name === role );

        if ( dat ) {
            return dat
        };
    } else {
        sendError( `Похоже, что у вас не установлена роль \`${ role }\`!`, message )
    };
};

//

const cooldowns = new Set();
var cooldown_time = 4

//

var bot_info = {
    author: "Zvbhrf#7309",
    version: "1.0.2",
    description: "Фан-бот, который был разработан по приколу ;)",
}

var prefix = "#"
var cmds = {
    "help": {
        args: "",
        desc: "Вывести доступные команды бота `uTool`",
        func: function( message, args, cmd ) {
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

    "info": {
        args: "",
        desc: "Вывести информацию о боте",
        func: function( message, args, cmd ) {
            message.channel.send( `Бот создан пользователем: \`${ bot_info.author }\`\nВерсия: \`${ bot_info.version }\`\nПодробнее: \`${ bot_info.description }\`` );
        }
    },

    "invite": {
        args: "",
        desc: "Вывести ссылку на приглашение бота в ваш Discord сервер",
        func: function( message, args, cmd ) {
            message.reply( "держи: https://discord.com/api/oauth2/authorize?client_id=898865198918676510&permissions=8&scope=bot\nСпасибо, что хочешь добавить меня 😍" )
        }
    },

    "random": {
        args: "N:N",
        desc: "Выводит рандомное число от и до",
        func: function( message, args, cmd ) {
            var nums = args[1].split( ":" );
            var max = 9999999

            if ( !Number( nums[ 0 ] ) || !Number( nums[ 1 ] ) ) { 
                message.channel.send( "Невернно введены аргументы" );

                return 
            };

            nums[ 0 ] = clamp( nums[ 0 ], -max, max )
            nums[ 1 ] = clamp( nums[ 1 ], -max, max )

            message.channel.send( `Выпало число: \`${ Math.floor( randomFromTo( nums[0], nums[1] ) ) }\`` );
        }
    },

    "db": {
        args: "STEAMID/STEAMID64/PROFILE-URL",
        desc: "Узнать информацию об пользователе, который играл на сервере",
        func: function( message, args, cmd ) {
            if ( !args[1] ) {
                var dat = cmds[ cmd ];

                message.reply( `\`${ prefix }${ cmd }${ dat.args != "" ? " " + dat.args : "" }\` - ${ dat.desc }` );
                
                return
            };

            var options = {
                host: "gmodugolochek.ru",
                path: "/api/player?s=" + args[1],

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
                                msg = "Ошибка: `Неверно введены данные`"
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
                                    .setAuthor( dat.name, dat.avatar, "https://gmodugolochek.ru/?steamid=" + dat.steamid )
                                    .setDescription( `Ник: \`${ dat.name }\`\nГруппа: \`${ dat.team }\`\n
                                        Последний визит: \`${ time.getHours() }:${ time.getMinutes() }:${ time.getSeconds() } ${ time.getDay() }/${ time.getMonth() + 1 }/${ time.getFullYear() } МСК\`` )

                                if ( dat.ban ) {
                                    var time_banned = new Date( Number( dat.ban.time ) * 1000 )
                                    var time_unban = new Date( Number( dat.ban.unban ) * 1000 )

                                    var banned = `Очень давно`
                                    var unban = `Никогда`

                                    if ( dat.ban.unban != "0" ) {
                                        unban = `${ time_unban.getHours() }:${ time_unban.getMinutes() }:${ time_unban.getSeconds() } ${ time_unban.getDay() }/${ time_unban.getMonth() + 1 }/${ time_unban.getFullYear() } МСК`
                                    }

                                    if ( time_banned != 0 ) {
                                        banned = `${ time_banned.getHours() }:${ time_banned.getMinutes() }:${ time_banned.getSeconds() } ${ time_banned.getDay() }/${ time_banned.getMonth() + 1 }/${ time_banned.getFullYear() } МСК`
                                    }

                                    var ban = new discord.MessageEmbed()
                                        .setColor( "#eb4037" )
                                        .setTitle( `${ dat.name } - Игрок в бане` )
                                        .setDescription( `Причина: \`${ dat.ban.reason }\`\nАдминистратор: \`${ dat.ban.admin }\`\n
                                            Разбан: \`${ unban }\`\nДата получения бана: \`${ banned }\`` )


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

    ///// ADMINISTRARION /////

    "kick": {
        args: "Mention",
        desc: "Кикает пользователя",
        func: function( message, args, cmd ) {
            if ( args[1] ) {
                if ( userHasRole( message, message.member, "uTool-Admin" ) ) {
                    var user = message.mentions.members.first();
                    var p = userHasRole( message, user, "uTool-Admin" );

                    if ( p ) {
                        sendError( `Вы не можете кикнуть данного пользователя (\`${ user.user.username }\`), так-как у него есть роль \`uTool-Admin\``, message );
                    } else {
                        user.kick().then( ( member ) => {
                            sendSuccess( member.displayName + " был кикнут :wave:", message );
                        } ).catch( () => {
                            sendError( `Похоже, что у меня нету разрешение на кик \`${ user.user.username }\`. Мне кажется, что роль пользователя выше чем моя`, message );
                        } );
                    };
                } else {
                    sendError( `У вас нету роли \`uTool-Admin\``, message )
                };
            } else {
                sendError( `Не указан аргумент \`Mention\``, message )
            };
        }
    },

    "ban": {
        args: "Mention",
        desc: "Банит юзера",
        func: function( message, args, cmd ) {
            if ( args[1] ) {
                if ( userHasRole( message, message.member, "uTool-Admin" ) ) {
                    var user = message.mentions.members.first();
                    var p = userHasRole( message, user, "uTool-Admin" );

                    if ( p ) {
                        sendError( `Вы не можете забанить данного пользователя (\`${ user.user.username }\`), так-как у него есть роль \`uTool-Admin\``, message );
                    } else {
                        user.ban().then( ( member ) => {
                            sendSuccess( member.displayName + " был забанен :wave:", message );
                        } ).catch( () => {
                            sendError( `Похоже, что у меня нету разрешение на бан \`${ user.user.username }\`. Мне кажется, что роль пользователя выше чем моя`, message );
                        } );
                    };
                } else {
                    sendError( `У вас нету роли \`uTool-Admin\``, message )
                };
            } else {
                sendError( `Не указан аргумент \`Mention\``, message )
            };
        }
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

    //

    if ( cooldowns.has( message.author.id ) ) {
        return
    } else {
        cooldowns.add( message.author.id );

        setTimeout( function() {
            cooldowns.delete( message.author.id );

        }, cooldown_time * 1000 );
    };

    //

    cmds[ cmd ].func( message, args, cmd );
});

client.on( "ready", () => {
    console.log( `Logged in as ${ client.user.tag }` );

    setInterval( function() {
        updateActivity();
    }, 600 * 1000 );

    updateActivity();
} );

client.login( "TOKEN-HERE" );
