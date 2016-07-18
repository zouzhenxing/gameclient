var server = require('http').createServer();
var io = require('socket.io')(server);

var users = {};
var rooms = {}

io.on('connection', function(socket){
  socket.join("public");

  socket.on("user.online",function( user ){
      user.room = "public";
      users[user.id] = user;

      socket.emit("room.change",getRooms());
      io.sockets.emit("user.online",getUsers());
  });

  socket.on("chat.send",function( chat ){
      var user = users[socket.id.replace("/#","")];
      socket.in(user.room).emit("chat.newchat",chat);
  });

  socket.on("room.leave",function(){
      var user = users[socket.id.replace("/#","")];
      var room = rooms[user.room];
      
      if( user.id == room.play1.id ) { //房主
          delete rooms[user.room];
          if( room.play2 ) {
              room.play2.status = 1;
              room.play2.room = "public";
              //找到对方的socket，离开房间进入public
              var so = io.sockets.sockets["/#" + room.play2.id];
              so.leave(user.room);
              so.join("public");
          }
      } else { //加入者
          room.play2 = null;
          socket.in(user.room).emit("room.createOK",room);
      }

      //自己退出房间
      socket.leave(user.room);
      socket.join("public");
      user.status = 1;
      user.room = "public";
      //自己退出房间，刷新房间列表
      io.sockets.in("public").emit("room.change",getRooms());
      io.sockets.emit("user.online",getUsers());
  });

  socket.on('disconnect', function(){
      var user = users[socket.id.replace("/#","")];
      if( user.status == 3 ) { //游戏状态
          var room = rooms[user.room];
          if( user.id == room.play1.id ) {
              delete rooms[user.room];
              room.play2.status = 1;
              room.play2.room = "public";
              room.play2.win += 1;
              room.play2.total += 1;
              //找到对方的socket，离开房间进入public
              var so = io.sockets.sockets["/#" + room.play2.id];
              so.leave(user.room);
              so.join("public");

              so.emit("game.over",room.play2);
              so.emit("chat.newchat",{
                nickname : '系统消息',
                msg : "您的对手被网络打败了"
              });
              io.sockets.in("public").emit("room.change",getRooms()); 
          } else {
              room.play1.status = 2;
              room.play1.win += 1;
              room.play1.total += 1;
              
              room.play2 = null;
              socket.in(user.room).emit("game.over",room.play1);
              socket.in(user.room).emit("room.createOK",room);
              socket.in(user.room).emit("chat.newchat",{
                nickname : '系统消息',
                msg : "您的对手被网络打败了"
              });
          }
      }

      if( user.status == 2 ) { //等待状态
          var room = rooms[user.room];
          if( user.id == room.play1.id ) {
              delete rooms[user.room];
              if( room.play2 ) {
                room.play2.status = 1;
                room.play2.room = "public";
                //找到对方的socket，离开房间进入public
                var so = io.sockets.sockets["/#" + room.play2.id];
                so.leave(user.room);
                so.join("public");
              }
              io.sockets.in("public").emit("room.change",getRooms());
          } else {
              room.play2 = null;
              socket.in(user.room).emit("room.createOK",room);
          }
      }

      //删除自己通知所有人
      delete users[socket.id.replace("/#","")];      
      io.sockets.emit("user.online",getUsers());
  });

  socket.on('room.create',function( roomname ){
      if( rooms[roomname] ) {
          socket.emit('room.exists');
          return;
      }

      var create = users[socket.id.replace("/#","")];
      create.status = 2; //准备中状态
      create.room = roomname;//切换房间
      socket.leave("public");
      socket.join(roomname);

      var room = {roomname:roomname,play1:create,play2:null};
      rooms[roomname] = room;

      //广播房间信息(排除在房间和自己)
      socket.in("public").emit("room.change",getRooms());
      //广播用户信息
      io.sockets.emit("user.online",getUsers());
      //通知创建者，创建成功
      socket.emit("room.createOK",room);
  });

  socket.on("room.join",function( roomname ){
      //找到房间，判断玩家二是否存在
      var room = rooms[roomname];
      if( room.play2 == null ) {
          //找到用户
          var user = users[socket.id.replace("/#","")];
          user.room = roomname;
          user.status = 2;
          socket.leave("public");
          socket.join(roomname);

          //将加入者给到play2
          room.play2 = user;

          //广播用户信息
          io.sockets.emit("user.online",getUsers());
          //通知加入者，创建成功
          socket.emit("room.joinOK",room);
          //通知创建者
          socket.in(roomname).emit("room.createOK",room);
      } else {
          socket.emit("room.joinFaild");
      }
  });

  //游戏开始指令
  socket.on("game.start",function(){
      var user = users[socket.id.replace("/#","")];
      var room = rooms[user.room];

      if( room.play1 && room.play2 ) {
          //向房主发送游戏开始指令
          socket.emit("game.start",1); //1代表先手执白

          //向玩家2发送游戏开始指令
          socket.in(user.room).emit("game.start",2);//2代表后手执黑

          //修改玩家的状态
          room.play1.status = 3;
          room.play2.status = 3;
          //向所有人广播
          io.sockets.emit("user.online",getUsers());
      }
  });

  //游戏数据交换指令
  socket.on("game.changedata",function( data ){
      var user = users[socket.id.replace("/#","")];
      socket.in( user.room ).emit("game.changedata",data);
  });

  //游戏结束指令
  socket.on("game.over",function(){
      //找到玩家
      var user = users[socket.id.replace("/#","")];
      var room = rooms[user.room];
      //
      var winer = user.id == room.play1.id ? room.play1 : room.play2;
      var faild = user.id == room.play1.id ? room.play2 : room.play1;
      
      //更改状态
      winer.win += 1;
      winer.total += 1;
      winer.status = 2;
      faild.total += 1;
      faild.status = 2;

      //返回游戏结束指令
      socket.emit("game.over",winer);
      socket.in(user.room).emit("game.over",faild);
      //向两位玩家发送一条系统消息
      io.sockets.in(user.room).emit("chat.newchat",{
          nickname : '系统消息',
          msg : winer.nickname + "赢了"
      });

      //向所有人广播
      io.sockets.emit("user.online",getUsers());
  });
});

function getUsers() {
    var arr = [];
    for( var key in users ) {
        arr.push(users[key]);
    }

    return arr;
}

function getRooms() {
    var arr = [];
    for( var key in rooms ) {
        arr.push(rooms[key]);
    }

    return arr;
}

//守护进程，以防止错误退出
process.on('uncaughtException', function (err) {
　　console.log('Caught exception: ' + err);
});

server.listen(3000);
console.log("服务器启动成功");