var pen = null; //画笔
var type = "pen"; //铅笔 line 直线 rect 矩形  arc 圆
var isdraw = false; //是否画
var offset = 0; //canvas与0 0 点的坐标

$(function(){
	pen = $("#can").get(0).getContext("2d");
	pen.strokeStyle = "black";
	offset = $("#can").offset();
	drawPen();
	
	$("#pen").click(function(){
		drawPen();
	});
	
	$("#line").click(function(){
		drawLine();
	});
	
	$("#rect").click(function(){
		drawRect();
	});
	
	$("#arc").click(function(){
		drawArc();
	});
	
	$("#eraser").click(function(){
		drawClear();
	});
	
	$("#save").click(function(){
		var str = $("#can").get(0).toDataURL();
		$("body").append("<img src='" + str + "'/>");
	});
	
	$("#linewidth").change(function(){
		pen.lineWidth = $(this).val();
	});
	
	$("#color").change(function(){
		pen.strokeStyle = $(this).val();
	});
});

function drawClear() {
	$("#can").unbind().mousedown(function( event ){
		isdraw = true;
	}).mousemove(function( event ){
		if( isdraw ) {
			var width = pen.lineWidth * 10;
			pen.clearRect( event.clientX - width / 2 - offset.left, event.clientY - width / 2 - offset.top,width,width );
		}
	}).mouseup(function(){
		isdraw = false;
	}).mouseleave(function(){
		isdraw = false;
	});
}

function drawArc() {
	var x = y = 0;
	$("#can").unbind().mousedown(function( event ){
		isdraw = true;
		pen.beginPath();
		x = event.clientX - offset.left;
		y = event.clientY - offset.top;
	}).mouseup(function( event ){
		if( isdraw ) {
			var width = event.clientX - offset.left - x;
			var heigh = event.clientY - offset.top - y;
			width = width > heigh ? width : heigh;
			
			pen.arc(x + width / 2 ,y + width / 2, width/2 ,0,2 * Math.PI);
			pen.stroke();
			pen.closePath();
		}
		isdraw = false;
	}).mouseleave(function(){
		isdraw = false;
	});
}

function drawRect() {
	var x = y = 0;
	$("#can").unbind().mousedown(function( event ){
		isdraw = true;
		pen.beginPath();
		x = event.clientX - offset.left;
		y = event.clientY - offset.top;
	}).mouseup(function( event ){
		if( isdraw ) {
			pen.rect(x,y,event.clientX - offset.left - x,event.clientY - offset.top - y);
			pen.stroke();
			pen.closePath();
		}
		isdraw = false;
	}).mouseleave(function(){
		isdraw = false;
	});
}

function drawLine() {
	$("#can").unbind().mousedown(function( event ){
		isdraw = true;
		pen.beginPath();
		pen.moveTo(event.clientX - offset.left,event.clientY - offset.top);
	}).mouseup(function( event ){
		if( isdraw ) {
			pen.lineTo(event.clientX - offset.left,event.clientY - offset.top);
			pen.stroke();
			pen.closePath();
		}
		isdraw = false;
	}).mouseleave(function(){
		isdraw = false;
	});
}

function drawPen() {
	$("#can").unbind().mousedown(function( event ){
		isdraw = true;
		pen.beginPath();
		pen.moveTo(event.clientX - offset.left,event.clientY - offset.top);
	}).mousemove(function( event ) {
		if( isdraw ) {
			pen.lineTo(event.clientX - offset.left,event.clientY - offset.top);
			pen.stroke();
		}
	}).mouseup(function( event ){
		pen.closePath();
		isdraw = false;
	}).mouseleave(function(){
		isdraw = false;
	});
}
