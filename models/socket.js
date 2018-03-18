
const socketio = require('socket.io');
var pg=require('pg');
var connect=process.env.DATABASE_URL||"postgres://postgres:1@localhost:5432/tankwar";
const game_info=require('../modules/game_info');
const games=require('../modules/games');

const init = ( app, server ) => {
  const io = socketio( server )
  app.set( 'io', io );
  var socket_list={}
  io.on( 'connection', function(socket) {
     
  	  socket.id = Math.floor(Math.random() * 1000000000000);
          // console.log(socket.id+" socket id");
           socket_list[socket.id] = socket;
           socket_list[socket.id].start=false;
           var current_user,game_member,prepare,game;
    
      socket.on('info',function(data){
        //console.log('info '+data.game_name);
            socket.current_user=data.username;
            socket.game_name=data.game_name;
            socket.game_member=data.game_member;
            game_info.insert_user(socket.game_name,false,socket.current_user);
           
      });

        var position_map=new Map();    
        socket.on('prepare',function(data){
                  prepare=data.prepare;
                  game_name=data.game_name;
                  current_user=data.current_user;
                  if(prepare===true){
                    for(var i in socket_list){
                      if(socket_list[i].current_user===current_user){
                       //  console.log('new player');
                         Player.onConnect(socket_list[i],current_user,game_name);
                      }
                       game_info.update(current_user,prepare);
                    }
                      
                  }else{
                    for(var i in socket_list){
                      if(socket_list[i].current_user==current_user){
                        delete Player.list[socket_list[i].id];
                      }
                    }
                       game_info.update(current_user,prepare);
                  }

                 var pgClient = new pg.Client(connect);
                 pgClient.connect();
                 pgClient.query("select count(*) as number from game_info where prepare=$1 and game_name=$2",[true,game_name],function(err,result){
                                    console.log(result.rows[0].number+" pre query");

                          if(result.rows[0].number==2){
                            console.log('start game');
                            game_info.reset(false,game_name);  
                             for(var i in socket_list){
                                  if(socket_list[i].game_name==game_name){
                                      socket_list[i].start=true;
                                      socket_list[i].emit("start",1);
                                      socket_list[i].emit('set_prepare');     
                                  }
                              }
                              for(var i=0;i<5;i++){
                                var id= Math.floor(Math.random() * 1000000000000);
                                   new Enemy({
                                        x:200,
                                        y:200,
                                        game:game_name,
                                        id:id
                                      });
                               }
                          }
                        })
                   });                              
    

         socket.on('disconnect',function(){
             var pgClient = new pg.Client(connect);
             pgClient.connect();
             if(socket.current_user=="undefined") return;
              //console.log('disconnect ');
              games.select_game_member(socket.game_name)
                .then(data =>{
                  //console.log(data[0].game_member+" game_member")
                if(data[0].game_member==2){
                  pgClient.query("delete from game_info where user_name=$1",[socket.current_user]); 
                  pgClient.query("update games set game_member=$1 where game_name=$2",[1,socket.game_name]);
                  for(var i in socket_list){
                    if(socket_list[i].game_name=socket.game_name){
                       socket_list[i].emit('game_over',{GAME_STATE_OVER:2,game:socket.game_name});
                       delete_everthing(socket.game_name);
                    }
                  }
              }else  if(data[0].game_member==1){
                //console.log(socket.game_name+" game");
                pgClient.query("delete from games where game_name=$1",[socket.game_name]); 
                pgClient.query("delete from game_info where user_name=$1",[socket.current_user]); 
                 for(var i in socket_list){
                    if(socket_list[i].game_name=socket.game_name){
                       socket_list[i].emit('game_over',{GAME_STATE_OVER:2,game:socket.game_name});
                       delete_everthing(socket.game_name);
                    }
                  }
              }
            })
            // console.log(socket.current_user+" current user");
             delete socket_list[socket.id];

          });

        socket.on('sendMsgToServer_game',function(data){
          //console.log('send to game');
              for(var i in socket_list){
                if(socket_list[i].game_name===socket.game_name){
                 // console.log(socket_list[i].id+" id "+ i);
                   socket_list[i].emit('addToChat_game',data);
                }
              }
         });


     		socket.on('sendMsgToServer',function(data){
                         // console.log("send message to chat");
                        for(var i in socket_list){
                                socket_list[i].emit('addToChat',data);
                        }
        });
  });
}



   setInterval(function(){
          var packs = Entity.getFrameUpdateData();
            for(var i in socket_list){
              var socket = socket_list[i];
              socket.emit('init',packs.initPack);
            //  console.log(packs.initPack.enemy.length+" enemy");
              if(socket.start===true){
                socket.emit('update',packs.updatePack);
                socket.emit('remove',packs.removePack);
              }
          }
    
 
  },40);


function delete_everthing(game){
      for(var i in Player.list){
               if(Player.list[i].game==game){
                    delete Player.list[i];
                }
            }  

           for(var k in Enemy.list){
              if(Enemy.list[k].game==game){
                delete Enemy.list[k];
              }
           }
               
            for(var f in Bullet.list){
              if(Bullet.list[f].game==game){
                delete Bullet.list[f];
              }
           }

 }



module.exports = {init};