var pen = null; //画笔全局变量
var offset = null;
var flag = 1; //1执白 2执黑
var data = [];//1表示白子 2黑子
var status = "run"; //run表示下棋 wait表示等待
/**
 * 游戏开始
 */
function gameInit( id,_flag ) {
	var html = '<canvas id="five" width="600px" height="600px"></canvas>';
	if( id ) {
		$("#" + id).append(html);
	} else {
		$("body").append(html);
	}
	
	pen = $("#five").get(0).getContext("2d");
	//画横线
	for( var i = 1;i < 15;i++ ) {
		pen.beginPath();
		if( i == 3 || i == 12 ) {
			pen.lineWidth = 3;
		} else {
			pen.lineWidth = 1;
		}
		pen.moveTo(0,i * 40);
		pen.lineTo(600,i*40);
		pen.stroke();
		pen.closePath();	
	}
	
	//画竖线
	for( var i = 1;i < 15;i++ ) {
		pen.beginPath();
		if( i == 3 || i == 12 ) {
			pen.lineWidth = 3;
		} else {
			pen.lineWidth = 1;
		}
		pen.moveTo( i * 40,0 );
		pen.lineTo( i * 40,600 );
		pen.stroke();
		pen.closePath();
	}
	
	//初始化数组
	for( var i = 0;i < 15;i++ ) {
		var temp = [];
		for( var j = 0;j < 15;j++ ) {
			temp.push(-1);
		}
		data.push(temp);
	}
	
	offset = $("#five").offset();
	if( _flag == 1 ) { //先手执白
		flag = 1; //白子
		status = "run";
		appendChat({
			nickname : "系统提示",
			msg : "系统分配，先手执白"
		},true);
	} else {
		flag = 2; //黑子
		status = "wait";
		appendChat({
			nickname : "系统提示",
			msg : "系统分配，后手执黑"
		},true);
	}
	
	$("#five").mousedown(function( event ){
		//等待状态，不画
		if( status == "wait" ) {
			return;
		}
		var x = event.clientX - offset.left;
		var y = event.clientY - offset.top;
		
		var row = Math.floor(y / 40);
		var col = Math.floor(x / 40);
		
		//如果已存在，则不画
		if( data[row][col] != -1 ) {
			return;
		}
		
		data[row][col] = flag;
		pen.beginPath();
		if( flag == 1 ) {
			pen.fillStyle = "white";
		} else {
			pen.fillStyle = "black";
		}
		pen.arc( col * 40 + 20,row * 40 + 20,15,0,2 * Math.PI );
		pen.fill();
		pen.closePath();
		
		//交换信息
		socket.emit("game.changedata",{
			row : row,
			col : col,
			flag : flag
		});
		status = "wait";
		gameOver(row,col,flag);
	});
}

function drawFive( row,col,flag ) {
	data[row][col] = flag;
	pen.beginPath();
	if( flag == 1 ) {
		pen.fillStyle = "white";
	} else {
		pen.fillStyle = "black";
	}
	pen.arc( col * 40 + 20,row * 40 + 20,15,0,2 * Math.PI );
	pen.fill();
	pen.closePath();
}

function gameOver( row,col,flag ) {
	//上下找
	var count = 1;
	for( var i = row - 1;i >= 0;i-- ) {
		if( data[i][col] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	for( var i = row + 1;i < 15;i++ ) {
		if( data[i][col] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	if( count >= 5 ) {
		alert("游戏结束");
		return;
	}
	
	//左右找
	count = 1;
	for( var i = col - 1;i >= 0;i-- ) {
		if( data[row][i] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	for( var i = col + 1;i < 15;i++ ) {
		if( data[row][i] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	if( count >= 5 ) {
		alert("游戏结束");
		return;
	}
	
	//左上右下
	count = 1;
	for( var i = row - 1,j = col -1;i >= 0 && j >= 0;i--,j-- ) {
		if( data[i][j] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	for( var i = row + 1,j = col + 1;i < 15 && j < 15;i++,j++ ) {
		if( data[i][j] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	if( count >= 5 ) {
		alert("游戏结束");
		return;
	}
	
	//右上左下
	count = 1;
	for( var i = row - 1,j = col + 1;i >= 0 && j < 15;i--,j++ ) {
		if( data[i][j] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	for( var i = row + 1,j = col - 1;i < 15 && j >= 0;i++,j-- ) {
		if( data[i][j] == flag ) {
			count ++;
		} else {
			break;
		}
	}
	if( count >= 5 ) {
		alert("游戏结束");
		return;
	}
}