$(function(){
	$(".contrain .left img").click(function(){
		var type = $(this).data("type");
		
		if( type == 0 ) {
			$(this).css("transform","translate(150px,140px)");
		} else if( type == 1 ) {
			$(this).css("transform","translate(150px,0px)");
		} else if( type == 2 ) {
			$(this).css("transform","translate(150px,-140px)");
		}
		
		var arr =  $(".contrain .right img");
		var temp = $(arr[Math.floor(Math.random() * arr.length)]);
		var type2 = temp.data("type");
		
		if( type2 == 0 ) {
			temp.css("transform","translate(-150px,140px)");
		} else if( type2 == 1 ) {
			temp.css("transform","translate(-150px,0px)");
		} else if( type2 == 2 ) {
			temp.css("transform","translate(-150px,-140px)");
		}
		
		var that = $(this);
		setTimeout(function(){
			that.css("transform","translate(0px,0px)");
			temp.css("transform","translate(0px,0px)");
		},1000);
		
		//比较
		var diff = type - type2;
		if(diff == 0) {
			$(".info ul").prepend("<li>平局"+ new Date() + "</li>");
		} else if( diff == -1 || diff == 2 ) {
			$(".info ul").prepend("<li>我赢了"+ new Date() + "</li>");
		} else {
			$(".info ul").prepend("<li>我输了"+ new Date() + "</li>");
		}
		
	});
});



























