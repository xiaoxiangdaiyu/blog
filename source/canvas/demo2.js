var Demo1 =  {
    init(){
        var canvas = document.querySelector('#tutorial');
        var ctx = canvas.getContext('2d');
        if(ctx){
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.moveTo(20, 20);
            ctx.lineTo(100, 50);
            ctx.lineTo(20, 100);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(100, 150);
            ctx.strokeStyle = "red";
            ctx.stroke();
        }else{
            alert('暂时不支持')
        }
    }
    
}
Demo1.init()