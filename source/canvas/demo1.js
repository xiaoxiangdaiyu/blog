var Demo1 =  {
    init(){
        var canvas = document.querySelector('#tutorial');
        var ctx = canvas.getContext('2d');
        if(ctx){
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(10, 10, 55, 50);

            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
            ctx.fillRect(30, 30, 55, 50);
        }else{
            alert('暂时不支持')
        }
    }
    
}
Demo1.init()