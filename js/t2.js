window.onload = function(){
	document.getElementById("btn").onclick = function() {
		if( this.innerHTML == "开灯" ) {
			document.body.style.backgroundColor = "black";
			this.innerHTML = "关灯";
		} else {
			document.body.style.backgroundColor = "white";
			this.innerHTML = "开灯";
		}
	}
}