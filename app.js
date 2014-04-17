    
    var count =0 ;
    window.addEventListener('keydown', function(evt){
        // console.log(evt.keyCode + " : " + count++);
        console.log(keycodes[evt.keyCode]);

    });

    var testprogram = "6177 6245 7101 8320 8121 8122 8233 8134\n8235 8106 8327 830e 64ff c411 32bb 1000\n0000";


    var keycodes = {
        49 : 0, 
        50 : 1,
        51 : 2, 
        52 : 3, 
        81 : 4, 
        87 : 5, 
        69 : 6, 
        82 : 7, 
        65 : 8, 
        83 : 9, 
        68 : 10, 
        70 : 11, 
        90 : 12, 
        88 : 13, 
        67 : 14, 
        86 : 15
    };

    // Screen Values

    var screenWidth  = 64;
    var screenHeight = 32;

    var pixelSize = 8
    var screensize = 32 * pixelSize;
    var theScreen = [screensize * screensize];
    //0x000-0x1FF'



    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = screenWidth * pixelSize;
    canvas.height = screenHeight * pixelSize;

    function drawScreen(array){
    	var len = array.length;
        console.log(len);
       // var array = new Uint8Array(16);
        // array[2] = 
        // var pixel = 
    	for(var i = 0; i < len; i++){
            var newy = (i / screenWidth) | 0; // round to int
            var newx  =  i % screenWidth;
            if(array[i]==1){
                ctx.fillRect(newx + (pixelSize * newx), newy + (pixelSize * newy), pixelSize ,pixelSize  );
            }
    	}
    }

    var chip = new Chip();
    var testa = getTestArray();

    function getTestArray(){
        var array = new Uint8Array(screenHeight * screenWidth);
        for( var i = 0 ; i < array.length ; i++){
            if(Math.random() > .5){
                 array[i] = 1;
            }        
        }
        return array;
    }

    //

    drawScreen(testa);
    chip.testRun();
   // console.log(opCodes);
