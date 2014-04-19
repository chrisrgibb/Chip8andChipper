




function Chip(){
	this.reset();

}

var TESTS = [];

var STEP_THROUGH = false;

Chip.prototype.reset = function(){
	console.log("reset ");
	this.I  = 0; // address register 
	this.pc = 0;     // program counter
    this.memory = new Uint8Array(4096);
	this.v = new Uint8Array(16);
	this.opcode = 0; // current opcode

	this.delay_timer = 0;
	this.sound_timer = 0; 

	this.stack = new Uint8Array(16); 
	this.sp = 0; // stack pointer

	this.keypad = new Uint8Array(16);
	this.drawflag = false;

	this.gfx = [theScreen.length];
}

Chip.prototype.testRun = function(){
	// test one
	// ANNN 
	var a = 0x2F0
	var pcstart = this.pc;
    this.memory[this.pc] = 0xA2;
    this.memory[this.pc + 1] = 0xF0;

    this.opcode =  this.memory[this.pc] << 8 | this.memory[this.pc + 1]; 
    this.fetch(this.opcode);

    TESTS.push(a==this.I && this.pc == pcstart+2);


    // test two
    this.reset();
    this.memory[this.pc] = 0x00;
    this.memory[this.pc + 1] = 0xEE;
  
    this.opcode =  this.memory[this.pc] << 8 | this.memory[this.pc + 1]; 
    this.fetch(this.opcode);
    // test 3
    this.reset();
 	var testop = 0x00e0;
 	this.fetch( testop );

 	// test 4 
 	this.reset();
 	var a = 0x20;
 	var b = 0x3f;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);

 	// test 5 
 	// 8XY4
 	this.reset();
 	console.log(" TEST 5 : ");
 	var a = 0x82;
 	var b = 0x34;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	//1000001000110100
 // & 1111000000000000
    this.reset();
 	console.log(" TEST 6 : 0xFX33  "  );
 	var a = 0xF2;
 	var b = 0x33;
 	this.opcode = a << 8 | b;
 	this.v[2] = 255;
 	this.fetch(this.opcode);
 	// test 7
 	this.reset();
 	console.log("TEST 7 : DXYN");
 	var a = 0xd2;
 	var b = 0x33;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	// test 8 
 	this.reset();
 	console.log("TEST 8 : KEY INPUT");
 	var a = 0xe2;
 	var b = 0x9e;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);

 	// test 9
 	// 1NNN
 	this.reset();
 	console.log("TEST 8 : jumpto");
 	var a = 0x12;
 	var b = 0x34;
 	this.opcode = a << 8 | b;
 	var fecthed = this.fetch(this.opcode);

 	// test 10
 	// 3XNN
 	this.reset();
 	console.log("tEST 9 : vx to nn");

 	var pcstart = this.pc;
 	this.v[2] = 0x43;
 	var a = 0x32;
 	var b = 0x43;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push((pcstart+2) == this.pc );


 	// test 11
 	// 7XNN
 	this.reset();
 	this.v[1] = 0x22;
 	var a = 0x71;
 	var b = 0x10;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push(this.v[1]== 50 );

 	// test 12
 	// 8XY1  vx or vy
 	this.reset();
 	this.v[1] = 0xaa;
 	this.v[2] = 0x55;
 	var a = 0x81;
 	var b = 0x21;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push(this.v[1]== 255 );

 	// test 13
 	// 8XY2 vx AND vy
 	this.reset();
 	this.v[1] = 0x22;
 	this.v[2] = 0x31
 	var a = 0x81;
 	var b = 0x22;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push(this.v[1]== 32 );

 	// test 14
 	// 8XY3 vx XOR vy
 	this.reset();
 	this.v[1] = 0x22;
 	this.v[2] = 0x31
 	var a = 0x81;
 	var b = 0x23;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push(this.v[1]== 19 );

 	// test 15
 	// 8XY5
	this.reset();
 	this.v[4] = 0x32;
 	this.v[5] = 0x16
 	var a = 0x84;
 	var b = 0x55;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	TESTS.push(this.v[4]==28);

 	// test 16
 	// 8XY5
 	// see what happens when we go over
	this.reset();
 	this.v[5] = 0x32;
 	this.v[4] = 0x16
 	var a = 0x84;
 	var b = 0x55;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	// console.log(this.v[4]);
 	TESTS.push(this.v[4]==28);


 	// test 17
 	// 8X0E 	"800E":
 	// bit shift to the left
	this.reset();
 	this.v[5] = 0x32;
 	this.v[4] = 0x16
 	var a = 0x84;
 	var b = 0x5E;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	// console.log(this.v[4]);
 	TESTS.push(this.v[4]==44  );

	// Test 18
	// CXNN v[x] = random number & NN
 	this.reset();
 	this.v[4] = 0x16
 	var a = 0xC4;
 	var b = 0x1c;
 	this.opcode = a << 8 | b;
 	this.fetch(this.opcode);
 	var randomnumber = this.v[4];
 	this.fetch(this.opcode);
 	TESTS.push(this.v[4] != randomnumber);
 	//do it again
 	// TESTS.push(this.v[4]==44 && v[16] );

 
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


/**
 *
 * a method that runs through a few test codes
 */
Chip.prototype.myCycle = function(opcodearray){
	var len = opcodearray.length;
	for(var i = 0; i< len; i++){
		this.fetch(opcodearray[i]);
	}
}



Chip.prototype.fetch = function(opcode){

	var convertedOp = ( opcode & 0xF000).toString(16);
	// console.log("convertedOp = " + convertedOp + ", op = " + opcode);

	// var opcodes = {

	// 	"a000" : function(opcode, chip){
	// 		chip.I = opcode & 0xF000;
	// 		console.log("exectued from json array");
	// 	},
	// 	"1000" : function(opcode, chip){
	// 		// jump to address 1NNN
	// 		var jumpto = opcode & 0x0FFF;
	// 		console.log(jumpto);
	// 		console.log("before " + pc);
	// 		chip.pc = jumpto;
	// 		console.log("after " + pc);
	// 	},
	// 	"2000" : function(opcode, chip){
	// 		chip.stack[chip.sp] = chip.pc;
	// 		++chip.sp;
	// 		chip.pc = opcode & 0x0FFF;
	// 		console.log(" Called from json ");
	// 	}
	// };

	// if(opcodes[convertedOp]){
	// 	console.log( "Yes + opcode  " + opcode.toString(16));
	// 	return opcodes[convertedOp](opcode, this);
	// }

	// first do all the ones dependent on first hex number
	switch(convertedOp){
		case "a000" :  // ANNN
			this.I = opcode & 0x0FFF;
			this.pc +=2;
		break;

		case "1000":
			var  jumpto = opcode & 0x0FFF;
			this.pc = jumpto;
			// jump to address 1NNN
		break;
		// 2NNN
		case "2000":
		// console.log(this.pc);
			this.stack[this.sp] = this.pc;
			++this.sp;
			this.pc = opcode & 0x0FFF;
			console.log("pc = " + this.pc + " stack = " + this.stack);
		break;
		// 
		case "3000":
			// Skips the next instruction if VX equals NN.
			var x = (opcode & 0x0F00) >> 8;
			var nn = (opcode & 0x00FF) ;
			if(this.v[x]==nn){
				this.pc+=2;
			}
		break;

		case "6000":
			// 6XKK
			// set v[x] to KK
			var x = (opcode & 0x0F00) >>8;
			var kk = (opcode & 0x00FF) ;
			this.v[x] = kk; 
		break;	

		case "7000":
			// 7XNN
			// set v[x] to v[x] + kk
			var x = (opcode & 0x0F00) >>8;
			var nn = (opcode & 0x00FF) ;
			this.v[x] += nn;
		break;

		case "0" :		
			this.compareOpcodeZero(opcode);
		break;
		case "c000":
			// CXNN 
			// random number AND NN
			var x     = (opcode & 0x0F00) >>8;
			var nn    = (opcode & 0x00FF) ;
			this.v[x] =( Math.random()  * 255) & nn;
			
		break;
		// Draw to Screen
		case "d000":
			this.drawScreen(opcode);
		break;

		case "e000":
			// console.log("get keys");
			if(this.keypad[this.v[(opcode & 0x0F00 ) >> 8]] != 0){
				this.pc += 4;
			}else{
				this.pc += 2;
			}
		break;

		default:
			console.log("Unknown op code "+ opcode.toString(16));
	}

	convertedOp = (opcode & 0x00F0).toString(16);
	switch(convertedOp){
		case "00E0":
			// clear the screen
			var len = this.gfx.length;
			for( var i =0 ; i< len; i++ ){
				gfx[i] = 0;
			}
		break;
	}

	convertedOp = ( opcode & 0xF00F ).toString(16);
	// console.log("second op" + convertedOp);
	switch(convertedOp){

		case "8000":
			// 8XY0
			// set the value of vx of vy
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			this.v[x] = this.v[y];
			this.pc+=2;
		break;

		case "8001":
			// 8XY1
			// set vx to vx or vy;
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			this.v[x] = this.v[x] | this.v[y];
			this.pc+=2;
		break;
		case "8002":
			// 8XY1
			// set vx to vx AND vy;
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			this.v[x] = this.v[x] & this.v[y];
			this.pc+=2;
		break;
		case "8003":
			// 8XY1
			// set vx to vx XOR vy;
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			this.v[x] = this.v[x] ^ this.v[y];
			this.pc+=2;
		break;
		case "8004":
			// add v y to vx
			// if y is > 255 - x set carry
			if(this.v[(opcode & 0x00F0) >> 4] > (0xFF - this.v[(opcode & 0x0F00) >> 8])){
				this.v[16] = 1; // set carry to 1
			}else{
				this.v[16] = 0;
			}
			// add  y to x
			this.v[(opcode & 0x0F00) >> 8] +=this.v[(opcode & 0x00F0) >> 4];
			this.pc+=2;
			break;

		case "8005":
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			if(this.v[y] > this.v[x]){  // y is bigger than x
				this.v[16] = 0;
			}else{
				this.v[16] = 1;
			}
			// need to check if it is overflowing
			this.v[x] -= this.v[y];
			this.pc+=2;
			break;
		case "8006":
			var x = (opcode & 0x0F00) >>8;
			var b = ( this.v[x] & 0x0001 ); // get least significat byte
			this.v[16] = b;
			this.v[x] = this.v[x] >> 1;
			this.pc+=2;
		break;
		case "8007":
			var x = (opcode & 0x0F00) >>8;
			var y = (opcode & 0x00F0) >>4;
			if(this.v[x] > this.v[y]){
				this.v[16] = 0;
			}else{
				this.v[16] = 1;
			}
			this.v[y] -=this.v[x];
			this.pc+=2;
		break;
		case "800e":
			// 8X0E
			//Shifts VX left by one. VF is set to the value of the most significant bit of VX before the shift.[
			// assuming it is the 8th bit???
			var x = (opcode & 0x0F00) >> 8;
			var b = (this.v[x] & 0x80) >> 7;
			this.v[16] = b;
			this.v[x] = this.v[x] << 1;
			this.pc+=2; 
		break;


		case "f003":
			// console.log("f003 "  + opcode +  " " + this.I);
			this.memory[this.I]   =  (this.v[(opcode & 0x0F00) >> 8] / 100  ) 	    | 0;
			this.memory[this.I+1] =  ((this.v[(opcode & 0x0F00) >> 8] / 10 ) % 10 )  | 0;
			this.memory[this.I+2] =  ((this.v[(opcode & 0x0F00) >> 8] % 100) % 10  ) | 0;
			this.pc += 2;
			console.log(this.memory[this.I] + " " + this.memory[this.I+1] + "  "  + this.memory[this.I+2] );
			break;
		// case ""
	}


}

Chip.prototype.drawScreen = function(opcode){
		console.log("draw screen");
		var x = this.v[((opcode & 0x0F00) >> 8 )];
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
		this.drawflag = false;
		this.pc +=2;
}

Chip.prototype.compareOpcodeZero = function(opcode){
	// console.log(" opcodeZero " + opcode);
	var convertedOp = ( opcode & 0x000F).toString(16);
	// console.log("convertedOp = " + convertedOp + ", op = " + opcode);
	switch(convertedOp){
		case "0":
			console.log(" its 0000");
			break;
		case "e":
			console.log(" its 000E");
			break;

	}
}

Chip.prototype.testF = function(){
	var gf = 0x68;
	var b1 =  gf  /100;
	var a1 = ( ( gf / 10) % 10 ) | 0;
	var a2 = ( gf % 100) % 10;
	console.log( b1 + " " + a1 + " "  + a2);


}
