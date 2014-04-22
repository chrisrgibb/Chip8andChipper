// $(document).ready(function() { 

    /*SETUP   
     *
     *
     */
    var count =0 ;
    window.addEventListener('keydown', function(evt){
        // console.log(evt.keyCode + " : " + count++);
        if(keycodes[evt.keyCode]){
           console.log(keycodes[evt.keyCode]);
           chip.keypad[ keycodes[evt.keyCode] ] = 1;
        }
    });

    window.addEventListener('keyup', function(evt){

        if(keycodes[evt.keyCode]){
             chip.keypad[ keycodes[evt.keyCode] ] = 0;

        }

    });

    // var testprogram = "6177 6245 7101 8320 8121 8122 8233 8134\n8235 8106 8327 830e 64ff c411 32bb 1000\n0000";
    // var testprogram = "610e 6204 D112";
    // var testprogram = "61ff 6201 8124 6301 6400 8435\n0000";
    // var testprogram = "6101 8127";
    var testprogram = "0000 000E E000 8120 6122 6202 F229 D888 6303 6303 D135";
    var BASE = 2; // 2 = binary 10 = decimal 16 = hex
    var checkbox = document.getElementById("myBox");
    var playbutton = document.getElementById("playbutton");
    var resetbutton = document.getElementById("resetbutton");
    var basebutton = document.getElementById("base");
    var running = false;
    var intervalID;

    playbutton.addEventListener("click", function(){
        // var arry = getOpcodeArray();
        // chip.myCycle(opcodeArray);
        // chip.myCycle(arry);
        var stepsize = 10;
        if(checkbox.checked){

            if(intervalID){
                clearInterval(intervalID);
            }
            // stepsize= 1;
            for( var i = 0; i< stepsize; i++){

                chip.otherCycle();
                updateHTML();
                playbutton.src="images/pause.png";
                if(chip.drawflag){
                    drawScreen(chip.gfx);
                    chip.drawflag = false;
                }
            }
        }else{
            running=true;
            intervalID = window.setInterval(function() { looploop()}, 16);
            
        }


   


    });
    basebutton.onchange = selectBase;

    resetbutton.addEventListener("click", function(){
        resetEverything();
        displayProgram();
    });

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

    canvas.width = screenWidth * pixelSize + 64;
    canvas.height = screenHeight * pixelSize + 32;
    var chip = new Chip();
    // var testa = getTestArray();

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
                // console.log(i);
                ctx.fillRect(newx + (pixelSize * newx), newy + (pixelSize * newy), pixelSize ,pixelSize  );
            }
    	}
    }

    function looploop(){

        chip.otherCycle();
        updateHTML();
        // playbutton.src="images/pause.png";
        if(chip.drawflag){
            ctx.clearRect(0, 0, screenWidth * pixelSize + 64,screenHeight * pixelSize + 32 );
            drawScreen(chip.gfx);
            chip.drawflag = false;
        }


    }


    function getTestArray(){
        var array = new Uint8Array(screenHeight * screenWidth);
        for( var i = 0 ; i < array.length ; i++){
            if(Math.random() > .5){
                 array[i] = 1;
            }        
        }
        return array;
    }

    function showregisterValues(){
        var regDiv = document.getElementById('registers');
        var len = this.chip.v.length;
        // var ulist = document.createElement("ul");
        var ulist = document.getElementById("registerlist");

        if(ulist.childNodes.length > 0){
            ulist.innerHTML = '';
            // ulist = document.createElement("ul");
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
            // console.log( shortArray[j].toString(16)  );
            chip.memory[0x200 + j] = shortArray[j];
        }
       // console.log(chip.memory);
    }

    function loadProgramAsString(programString){

        console.log("loadProgramAsString " + programString.length);
        // convert giant string into array of ints
        var temparray = programString.replace(/\n/g, " ").split(" ");
        var opcodeArray = [];
        for(var i = 0; i < temparray.length; i++){
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
                console.log("Stop here");
            }

            // console.log( shortArray[j].toString(16)  );
            chip.memory[0x200 + j] = shortArray[j];
        }


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
    /*
     *  add
     */
    function updateprogram(){


    } 

    function resetEverything(){
        chip.reset();
        showregisterValues();
        STEP_THROUGH_COUNT = 0;
        //showvalues(this.TESTS, 'tests', 'testlist');
    }

    function updateHTML(){
        showregisterValues();
        showvalues(this.TESTS, 'tests', 'testlist');
    }

    function displayProgram(){
        var codeBox = document.getElementById('testprogram');
        var arry = getOpcodeArray();
        var str= "PC : " + chip.pc + "<br>";
        for(var i = 0; i < arry.length; i++){
            if(i==STEP_THROUGH_COUNT){
                str += " > " + i + ":  " + arry[i].toString(16) + "<br>";

            }else{
                str += i + ":  " + arry[i].toString(16) + "<br>";
            }
            // console.log(arry[i].toString(16));
        }
        if( STEP_THROUGH_COUNT >= arry.length){
            str+=">done";
        }
        codeBox.innerHTML = str;
        console.log(str);
    }

    function displayProgram2(){
        var codeBox = document.getElementById('testprogram');
        // console.log(chip.pc);
        var str= "delay timer : "+ chip.delay_timer + "<br>"; 
        str += "PC : " + chip.pc + "<br>";
        if(chip.pc>5){
            var stopAt = chip.pc+20;
            var i = chip.pc;
            str += "> " + i + ": " + chip.memory[i].toString(16) + chip.memory[i+1].toString(16) +  "<br>";
            i+=2;
            while(i < stopAt){

                str += i + ": " + chip.memory[i].toString(16) + chip.memory[i+1].toString(16) +  "<br>";
                i +=2;
            }

            // for(var i = chip.pc; i< stopAt; i++){
            //     str += i + ": " + chip.memory[i].toString(16) + "<br>";
            // }
        }
        // if(  )
        codeBox.innerHTML = str;

    }


    function displayMemory(){
        var memorydiv = document.getElementById('memory');
        chip.I = 512;
        for (var i = chip.I -2; i < 5; i++){
            memorydiv.innerHTML += chip.memory[i] +"<br>";
        } 
    }

    function selectBase(evt){
        // console.log(evt);
        BASE = basebutton.value;
        showregisterValues();
    }


    // loadprogramintoMemory();
    loadProgramAsString(progam8);
    // chip.myCycle(opcodeArray);

    // chip.testRun();
    // var testpackage = new TestPackage();
    // testpackage.testSuite();
    showregisterValues();
    // showvalues(this.TESTS, 'tests', 'testlist');
    displayProgram2();
    // loadProgramAsString(progam8);

    // });

