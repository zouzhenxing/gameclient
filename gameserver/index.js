//创建websocket服务器
var server = require('http').createServer();
var io = require('socket.io')(server);

//socket就是客户端与服务器的通道
io.on('connection', function(socket){
  console.log("一个用户连接到服务器");
  
  //自定义事件
//   socket.on('event', function(data){});
  
  socket.on('disconnect', function(){
      console.log("用户断开连接");
  });
});

//开启服务器
server.listen(3000);
console.log('服务器开启成功!');