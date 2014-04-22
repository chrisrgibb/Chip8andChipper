




function Chip(){
	this.reset();

}

var TESTS = [];
// var TESTS2;

var STEP_THROUGH = false;
var STEP_THROUGH_COUNT = 0;

Chip.prototype.reset = function(){
	// console.log("reset ");
	this.I  = 0; // address register 
	this.pc = 0x200;     // program counter
    this.memory = new Uint8Array(4096);
	this.v = new Uint8Array(16);
	this.opcode = 0; // current opcode

	this.delay_timer = 0;
	this.sound_timer = 0; 

	this.stack = new Uint16Array(16); 
	this.sp = 0; // stack pointer

	this.keypad = new Uint8Array(16);
	this.drawflag = false;

	// this.gfx = [32 * 64];
	this.gfx = new Uint8Array(32 * 64);

	this.fontset = new Uint8Array([  0xF0, 0x90, 0x90, 0x90, 0xF0, 
									 0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
									0x20, 0x60, 0x20, 0x20, 0x70, // 1
									0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
									0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
									0x90, 0x90, 0xF0, 0x10, 0x10, // 4
									0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
									0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
									0xF0, 0x10, 0x20, 0x40, 0x40, // 7
									0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
									0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
									0xF0, 0x90, 0xF0, 0x90, 0x90, // A
									0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
									0xF0, 0x80, 0x80, 0x80, 0xF0, // C
									0xE0, 0x90, 0x90, 0x90, 0xE0, // D
									0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
									0xF0, 0x80, 0xF0, 0x80, 0x80  // F

	 ]);

	for(var i = 0; i< 80; i++){
		this.memory[i] = this.fontset[i];
	}
}


Chip.prototype.cycle = function(){
         // Fetch Opcode
        var fetchedOp = this.fetch(this.opcode);
        if(fetchedOp){
      	   fetchedOp(); //execute op;
     	}
        if(delay_timer > 0){
         	delay_timer--;
        }
        if(sound_timer > 0){
         	if(sound_timer==1){
         		console.log(" BEEEP");
         	}
         	sound_timer--;
        }

          // Decode Opcode
          // Execute Opcode
         
          // Update timers
}


/*
 * 	Load program into memory
 */
Chip.prototype.loadProgram = function(program){




}


/**
 *
 * a method that runs through a few test codes
 */
Chip.prototype.myCycle = function(opcodearray){
	if(checkbox.checked){
		this.fetch(opcodearray[STEP_THROUGH_COUNT]);
		STEP_THROUGH_COUNT++;
	}else{
		var len = opcodearray.length;
		for(var i = 0; i< len; i++){
			this.fetch(opcodearray[i]);
		}
		STEP_THROUGH_COUNT  = len;
	}
	displayProgram();
}



Chip.prototype.fetch = function(opcode){

	var convertedOp = ( opcode & 0xF000).toString(16);
	// console.log("convertedOp = " + convertedOp + ", op = " + opcode);

	var opcodes = {

		"1000" : function(opcode, chip){
			// jump to address 1NNN
			var jumpto = opcode & 0x0FFF;
			// console.log(jumpto);
			// console.log("before " + pc);
			chip.pc = jumpto;
			// console.log("after " + pc);
		},
		"2000" : function(opcode, chip){
			chip.stack[chip.sp] = chip.pc;
			++chip.sp;
			chip.pc = opcode & 0x0FFF;
			console.log(" Called from json ");
		},
		"3000" : function(opcode, chip){
			// Skips the next instruction if VX equals NN.
			var x = (opcode & 0x0F00) >> 8;
			var nn = (opcode & 0x00FF) ;
			if(chip.v[x]==nn){
				chip.pc+=2;
			}			
		},
		"6000" : function(opcode, chip){
			// 6XKK
			// set v[x] to KK
			var x = (opcode & 0x0F00) >>8;
			var kk = (opcode & 0x00FF) ;
			chip.v[x] = kk; 
			chip.pc +=2;
		},
		"7000" : function(opcode, chip){
			// 7XNN
			// set v[x] to v[x] + kk
			var x = (opcode & 0x0F00) >>8;
			var nn = (opcode & 0x00FF) ;
			chip.v[x] += nn;
			chip.pc += 2;
		},
		"8000" : function(opcode, chip){
			var convertedOp = (opcode & 0xF00F).toString(16);
			switch(convertedOp){
				case "8000":
					
					// 8XY0
					// set the value of vx of vy
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					chip.v[x] = chip.v[y];
					chip.pc+=2;
				break;
				case "8001":				
					// 8XY1
					// set vx to vx or vy;
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					chip.v[x] = chip.v[x] | chip.v[y];
					chip.pc+=2;		
				break;
				case "8002":
					// 8XY2
					// set vx to vx AND vy;
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					chip.v[x] = chip.v[x] & chip.v[y];
					chip.pc+=2;
				break;
				case "8003":
					// 8XY3
					// set vx to vx XOR vy;
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					chip.v[x] = chip.v[x] ^ chip.v[y];
					chip.pc+=2;
				break;
				case "8004":
					// add v y to vx
					// if y is > 255 - x set carry
					if(chip.v[(opcode & 0x00F0) >> 4] > (0xFF - chip.v[(opcode & 0x0F00) >> 8])){
						chip.v[15] = 1; // set carry to 1
					}else{
						chip.v[15] = 0;
					}
					// add  y to x
					chip.v[(opcode & 0x0F00) >> 8] +=chip.v[(opcode & 0x00F0) >> 4];
					chip.pc+=2;
				break;
				case "8005":
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					if(chip.v[y] > chip.v[x]){  // y is bigger than x
						chip.v[15] = 0;
					}else{
						chip.v[15] = 1;
					}
					// need to check if it is overflowing
					chip.v[x] -= chip.v[y];
					chip.pc+=2;
				break;
				case "8006":
					var x = (opcode & 0x0F00) >>8;
					var b = ( chip.v[x] & 0x0001 ); // get least significat byte
					chip.v[15] = b;
					chip.v[x] = chip.v[x] >> 1;
					chip.pc+=2;
				break;

				case "8007":
					var x = (opcode & 0x0F00) >>8;
					var y = (opcode & 0x00F0) >>4;
					if(chip.v[x] > chip.v[y]){
						chip.v[15] = 0;
					}else{
						chip.v[15] = 1;
					}
					chip.v[y] -=chip.v[x];
					chip.pc+=2;
				break;
			}
		},
		"9000" : function(opcode, chip){
			// 9XY0 Skips the next instruction if VX doesn't equal VY.
			var x = (opcode & 0x0F00) >> 8;
			var y = (opcode & 0x00F0) >> 4;
			console.log( " x : " + x + " y : " +  y );
			if(chip.v[x]!=chip.v[y]){
				chip.pc+=4;
			}else{
				chip.pc+=2;
			}
		},
		"a000" : function(opcode, chip){
			chip.I = opcode & 0x0FFF;
			chip.pc +=2;
			console.log("exectued from json array");
		},
		"b000" : function(opcode, chip){
			// BNNN	Jumps to the address NNN plus V0.
			chip.pc = (opcode & 0x0FFF) + chip.v[0];


		},
		"c000" :function(opcode,chip){
			// CXNN 
			// random number AND NN
			var x     = (opcode & 0x0F00) >>8;
			var nn    = (opcode & 0x00FF) ;
			var rand = (Math.random() *255) | 0;
			chip.v[x] = rand & nn;
			chip.pc +=2;
		},
		/**
			Draw function
		*/
		"d000" : function(opcode,chip){
			console.log("draw screen");
			var x = chip.v[((opcode & 0x0F00) >>	 8 )];
			var y = chip.v[(opcode & 0x00F0) >> 4 ];
			var height = (opcode & 0x000F)  ;
			var pixel; 
			console.log(" x : " + x + " y : " + y + " height : " + height);
			for( var yline = 0; yline < height; yline++){
				pixel = chip.memory[chip.I + yline];
				for( var xline = 0; xline < 8; xline++){
					if((pixel & (0x80 >> xline)) != 0){
						if(chip.gfx[ x + xline +((y + yline) * 64 )] ==1  ){
							chip.v[0xF] =1;
						}
						chip.gfx[x + xline + ((y + yline) * 64)] ^= 1;
					}
				}
			}
			chip.drawflag = true;
			chip.pc +=2;
			
		},
		"e000" : function(opcode, chip){

			var convertedOp = (opcode & 0x00FF).toString(16);
			switch(convertedOp){
				case "9e":
					if(chip.keypad[chip.v[(opcode & 0x0F00 ) >> 8]] != 0){
						chip.pc += 4;
					}else{
						chip.pc += 2;
					}
				break;
				case "a1":
					if(chip.keypad[chip.v[(opcode & 0x0F00 ) >> 8]] == 0){
						chip.pc += 4;
					}else{
						chip.pc += 2;
					}
				break;
			}
			
		},
		"f000" : function(opcode, chip){
			var convertedOp = (opcode & 0xF0FF).toString(16);
			switch ( convertedOp ){
				case "f007" : 
					var x = (opcode & 0x0F00) >>8;
					chip.v[x] = chip.delay_timer;
				break;
				case "f00a" :

				break;

				case "f015" :
					var x = (opcode & 0x0F00) >>8;
					chip.delay_timer = chip.v[x];
				break;

				case "f018" :
					var x = (opcode & 0x0F00) >> 8;
					chip.sound_timer = chip.v[x];
				break;
				case "f01e":
					var x = (opcode & 0x0F00) >> 8;
					chip.I += chip.v[x];
				break;
				case "f033":
					console.log("f003 "  + opcode +  " " + chip.I);
					chip.memory[chip.I]   =  (chip.v[(opcode & 0x0F00) >> 8] / 100  ) 	    | 0;
					chip.memory[chip.I+1] =  ((chip.v[(opcode & 0x0F00) >> 8] / 10 ) % 10 )  | 0;
					chip.memory[chip.I+2] =  ((chip.v[(opcode & 0x0F00) >> 8] % 100) % 10  ) | 0;
					chip.pc += 2;
					console.log(chip.memory[chip.I] + " " + chip.memory[chip.I+1] + "  "  + chip.memory[chip.I+2] );
				break;
			}	
		}

	};

	if(opcodes[convertedOp]){
		console.log( "Yes + opcode  " + opcode.toString(16));
		return opcodes[convertedOp](opcode, this);
	}else{



		// first do all the ones dependent on first hex number
		switch(convertedOp){
			case "0" :		
				this.compareOpcodeZero(opcode);
			break;

			default: 
		}

		convertedOp = (opcode & 0x00F0).toString(16);
		switch(convertedOp){
			case "00E0":
				// clear the screen
				var len = this.gfx.length;
				for( var i =0 ; i< len; i++ ){
					this.gfx[i] = 0;
				}
			break;
		}

		convertedOp = ( opcode & 0xF00F ).toString(16);
		// console.log("second op" + convertedOp);
		if(opcodes[convertedOp]){
			return opcodes[convertedOp](opcode, this);
		}

		switch(convertedOp){

			case "800e":
				// 8X0E
				//Shifts VX left by one. VF is set to the value of the most significant bit of VX before the shift.[
				// assuming it is the 8th bit???
				var x = (opcode & 0x0F00) >> 8;
				var b = (this.v[x] & 0x80) >> 7;
				this.v[15] = b;
				this.v[x] = this.v[x] << 1;
				this.pc+=2; 
			break;
			// case ""
		}

	}
}

Chip.prototype.drawScreen = function(opcode){
		console.log("draw screen");
		var x = this.v[((opcode & 0x0F00) >>	 8 )];
		var y = this.v[(opcode & 0x00F0) >> 4 ];
		var height = (opcode & 0x000F)  ;
		var pixel; 
		console.log(" x : " + x + " y : " + y + " height : " + height);
		for( var yline = 0; yline < height; yline++){
			pixel = this.memory[this.I + yline];
			for( var xline = 0; xline < 8; xline++){
				if((pixel & (0x80 >> xline)) != 0){
					if(this.gfx[ x + xline +((y + yline) * 64 )] ==1  ){
						this.v[0xF] =1;
					}
					this.gfx[x + xline + ((y + yline) * 64)] ^= 1;
				}
			}
		}
		this.drawflag = true;
		this.pc +=2;
}


Chip.prototype.compareOpcodeZero = function(opcode){
	// console.log(" opcodeZero " + opcode);
	var convertedOp = ( opcode & 0x000F).toString(16);
	// console.log("convertedOp = " + convertedOp + ", op = " + opcode);
	switch(convertedOp){
		case "0":
			// clear the screen
			var len = this.gfx.length;
			for(var i = 0; i< len; i++){
				this.gfx[i] = 0;
			}
			this.drawflag = true;
			this.pc+=2;
			// console.log(" its 0000");
			break;
		case "e":
			// return from sub routine	
			console.log(" its 000E");
			break;

	}
}

Chip.prototype.testDraw = function(){
	this.memory[I]     = 0x3C;
	this.memory[I + 1] = 0xC3;
	this.memory[I + 2] = 0xFF;
	
}

Chip.prototype.testF = function(){
	var gf = 0x68;
	var b1 =  gf  /100;
	var a1 = ( ( gf / 10) % 10 ) | 0;
	var a2 = ( gf % 100) % 10;
	console.log( b1 + " " + a1 + " "  + a2);


}
