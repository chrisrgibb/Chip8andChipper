// $(document).ready(function() { 

    /*SETUP   
     *
     *
     */
    var count =0 ;

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
    
    window.addEventListener('keydown', function(evt){
       
        if(keycodes[evt.keyCode]){
           chip.keypad[ keycodes[evt.keyCode] ] = 1;
        } 
    });

    window.addEventListener('keyup', function(evt){
        if(keycodes[evt.keyCode]){
             chip.keypad[ keycodes[evt.keyCode] ] = 0;
        }
    });

    var BASE = 2; // 2 = binary 10 = decimal 16 = hex
    var checkbox = document.getElementById("myBox");
    var playbutton = document.getElementById("playbutton");
    var resetbutton = document.getElementById("resetbutton");
    var basebutton = document.getElementById("base");
    var running = false;
    var intervalID;
    var stepsize = 10;

    document.getElementById("stepsize").addEventListener('change', function(evt){
        stepsize = this.value;
    });

    playbutton.addEventListener("click", function(){
        if(checkbox.checked){
            if(intervalID){
                clearInterval(intervalID);
            }
            for( var i = 0; i< stepsize; i++){
                chip.cycle();
                updateHTML();
                playbutton.src="images/pause.png";
                if(chip.drawflag){
                    drawScreen(chip.gfx);
                    chip.drawflag = false;
                }
            }
        }else{
            console.log("esle");
            running=true;
            intervalID = window.setInterval( mainLoop ,10);
        }
     //   turnProgramIntoGiantString();
    });

    basebutton.onchange = selectBase;

    resetbutton.addEventListener("click", function(){
        resetEverything();
        displayProgram();
    });

    // var keycodes = {
    //     49 : 1, 
    //     50 : 2,
    //     51 : 3, 
    //     52 : 4, 
    //     81 : 5, 
    //     87 : 6, 
    //     69 : 7, 
    //     82 : 8, 
    //     65 : 9, 
    //     83 : 10, 
    //     68 : 11, 
    //     70 : 12, 
    //     90 : 13, 
    //     88 : 14, 
    //     67 : 15, 
    //     86 : 16
    // };



    // Screen Values

    var screenWidth  = 64;
    var screenHeight = 32;

    var pixelSize = 8
    var screensize = 32 * pixelSize;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = screenWidth * pixelSize ;
    canvas.height = screenHeight * pixelSize ;
    var chip = new Chip();
 
    /*    
     * functions
     *
     */


    function drawScreen(array){
    	var len = array.length;

    	for(var i = 0; i < len; i++){
            var newy = (i / screenWidth) | 0; // round to int
            var newx  =  i % screenWidth;
            if(array[i]==1){
                ctx.fillRect((pixelSize * newx),  (pixelSize * newy), pixelSize ,pixelSize  );
            }
    	}
    }

    function mainLoop(){
        chip.cycle();

        // updateHTML();

        if(chip.drawflag){
            ctx.clearRect(0, 0, screenWidth * pixelSize + 64,screenHeight * pixelSize + 32 );
            drawScreen(chip.gfx);
            chip.drawflag = false;
        }
    }

    function showregisterValues(){
        var regDiv = document.getElementById('registers');
        var len = this.chip.v.length;
        // var ulist = document.createElement("ul");
        var ulist = document.getElementById("registerlist");

        if(ulist.childNodes.length > 0){
            ulist.innerHTML = '';
        }

        for(var i = 0 ; i < len ; i++ ){
            var listitem = document.createElement("li");
            // listitem.innerHTML = "v[" + i +  "] = " +  getFullBinary(this.chip.v[i]) ;
            listitem.innerHTML = "v[" + i +  "] = " +  getValueCurrentBase(this.chip.v[i]) ;
            ulist.appendChild(listitem);
            // console.log(this.chip.v[i]);
        }
    }

    function getValueCurrentBase(val){
        if(BASE==2){
            return getFullBinary(val);
        }else if(BASE==16){
            //  return hex;
            var num = val.toString(16);
            var str= "0x" + num;
            return str;
        }else{
            return val;
        }
    }

    /*
     *  Takes an array and copies it to the chips memory 
     */
    function loadprogramintoMemory(){
        var array = getOpcodeArray();
        var len = array.length;
        var shortArray = [];
        for( var i = 0; i< len ; i++){
            var higherbit = (array[i] & 0xFF00) >> 8;
            var lowerbit  = (array[i] & 0x00FF);
            shortArray.push(higherbit);
            shortArray.push(lowerbit);
        }
        for( var j = 0 ; j < shortArray.length; j++){
            // console.log( shortArray[j].toString(16)  
            chip.memory[0x200 + j] = shortArray[j];
        }
    }

    function loadProgramAsString(programString){

        console.log("loadProgramAsString " + programString.length);
        // convert giant string into array of ints
        var temparray = programString.replace(/\n/g, " ").split(" ");

        // for(var i = 0 ; i< temparray.length; i++){
            // console.log(temparray[i]);
        // }


        var opcodeArray = [];
        for(var i = 0; i < temparray.length; i++){
            var opcode = parseInt(temparray[i], 16);
            if(opcode==0){
                console.log(" op" + opcode);
            }
            opcodeArray.push(parseInt(temparray[i], 16));
        }

        // split each 16 bit byte into 2 8 bit bytes and 
        // push into array of short
        var len = opcodeArray.length;
        var shortArray = [];
        for( var i = 0; i< len ; i++){
            var higherbit = (opcodeArray[i] & 0xFF00) >> 8;
            var lowerbit  = (opcodeArray[i] & 0x00FF);
            shortArray.push(higherbit);
            shortArray.push(lowerbit);
        }
        // copy into the chips memory
        for( var j = 0 ; j < shortArray.length; j++){
            if ( (0x200 + j ) == 538  ){
                // console.log("Stop here");
            }
            chip.memory[0x200 + j] = shortArray[j];
        }
    }

    function xhrProgram(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/invaders.c8', true);
        // xhr.open('GET', '/pong2.c8', true);
        // xhr.open('GET', '/tetris.c8', true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(oEvent){

        var arraybuffer = xhr.response;
            if( arraybuffer) {
                var byteArray = new Uint8Array(arraybuffer);
                for(var i = 0;i < byteArray.length; i++){
                    chip.memory[i+0x200] = byteArray[i];
                }
            }
        }
        xhr.send();
    }   


    function showvalues(array, divname, ulname){
        var div = document.getElementById(divname);
        var ulist = document.getElementById(ulname);
        var len = array.length;

        if(ulist.childNodes.length > 0){
            ulist.innerHTML = '';
        }
        for(var i = 0 ; i < len ; i++){
            var listitem = document.createElement('li');
            listitem.innerHTML = "test " + i + " : " + array[i];
            ulist.appendChild(listitem); 
        }
    }

    function getOpcodeArray(){
        var temparray = testprogram.replace(/\n/g, " ").split(" ");
        var opcodeArray = [];
        for(var i = 0; i <temparray.length; i++){
            // var str = "0x" +temparray[i];
            // opcodeArray.push(parseInt(str));
            var val1 = temparray[i];
            var convertedval = parseInt(val1, 16);

            opcodeArray.push(parseInt(temparray[i], 16));
        }
        return opcodeArray;
    }

    /*
     * 
     *  takes a number and adds 0s to get the full 8-bit representation in binary
     */
    function getFullBinary(number){
        var num = number.toString(2);
        var len = num.length;
        if(len>7){
            return num;
        }
        var str = "";
        for(var i = 0; i< (8 - len); i++){
            str = str + '0';
        }
        str = str + num;
        return str;
    }

    function turnProgramIntoGiantString(){

        var byteArray = new Uint8Array(4096);

        var j = 0x200, i = 0, len = chip.memory.length-0x200;
        var str = "";
        while(j < len){
            if(j%32==0){
                console.log("pause here");
            }
            i=0;
            str += (j-0x200).toString(16);
            while(i < 8){
                if(i % 2==0){
                    str+=' ';
                }
                // var code = byteArray[j+i].toString(16);
                if(chip.memory[j+i]){
                    // str += code;
                    var code = chip.memory[j+i].toString(16);
                    str += chip.memory[j+i].toString(16);
                }else if(chip.memory[j+i]==0){
                    str += '00';
                }  
                i++;
            }
            str+= '\n';
            j+=8;
        }
        // console.log(str);
    }

    function resetEverything(){
        chip.reset();
        showregisterValues();
        STEP_THROUGH_COUNT = 0;
        //showvalues(this.TESTS, 'tests', 'testlist');
    }

    function updateHTML(){
        // showregisterValues();
        // showvalues(this.TESTS, 'tests', 'testlist');
        displayProgram();
    }

    function displayProgram(){
        var codeBox = document.getElementById('testprogram');
        // console.log(chip.pc);
        var str= "delay timer : "+ chip.delay_timer + "<br>"; 
        str += "PC : " + chip.pc + "<br>";
        if(chip.pc>5){
            var stopAt = chip.pc+20;
            var i = chip.pc-4;

            while(i < stopAt){
                if(i==chip.pc){
                     str += "> " + i + ": " + getOpcodeHex(i) +  "<br>";
                }else{
                    str += i + ": " + getOpcodeHex(i) +  "<br>";
                }
                i +=2;
            }
        }
        codeBox.innerHTML = str;
    }

    function getOpcodeHex(index){
        var hibyte  = chip.memory[index].toString(16);
        var lowbyte = chip.memory[index+1].toString(16);
        if(hibyte=='0'){
            hibyte = '00';
        }
        if(lowbyte=='0'){
            lowbyte='00';
        }
        return hibyte+lowbyte;
    }

    function printCodes(){
        var array = chip.memory;
        for(var i =0x200 ; i< array.length; i++){
            console.log(array[i]);
        }
    }

    function selectBase(evt){
        // changes the base of the registers from binary to hex etc
        BASE = basebutton.value;
        showregisterValues();
    }


    xhrProgram();

    showregisterValues();
    displayProgram();

    

