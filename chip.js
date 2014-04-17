

function Chip(){
	this.reset();

}

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
	this.sp = 0;

	this.keypad = new Uint8Array(16);
	this.drawflag = false;

	this.gfx = [theScreen.length];
}

Chip.prototype.testRun = function(){
	// test one
    this.memory[this.pc] = 0xA2;
    this.memory[this.pc + 1] = 0xF0;

    this.opcode =  this.memory[this.pc] << 8 | this.memory[this.pc + 1]; 
    this.lookupOpcode(this.opcode);
    // test two
    this.reset();
    this.memory[this.pc] = 0x00;
    this.memory[this.pc + 1] = 0xEE;
  
    this.opcode =  this.memory[this.pc] << 8 | this.memory[this.pc + 1]; 
    this.lookupOpcode(this.opcode);
    console.log("pc" + this.pc);
    // test 3
    this.reset();
 	var testop = 0x00e0;
 	this.lookupOpcode( testop );

 	// test 4 
 	this.reset();
 	var a = 0x20;
 	var b = 0x3f;
 	this.opcode = a << 8 | b;
 	this.lookupOpcode(this.opcode);

 	// test 5 
 	this.reset();
 	console.log(" TEST 5 : ");
 	var a = 0x82;
 	var b = 0x34;
 	this.opcode = a << 8 | b;
 	this.lookupOpcode(this.opcode);
 	//1000001000110100
 // & 1111000000000000
    this.reset();
 	console.log(" TEST 6 : 0xFX33  "  );
 	var a = 0xF2;
 	var b = 0x33;
 	this.opcode = a << 8 | b;
 	this.v[2] = 255;
 	this.lookupOpcode(this.opcode);
 	// test 7
 	this.reset();
 	console.log("TEST 7 : DXYN");
 	var a = 0xd2;
 	var b = 0x33;
 	this.opcode = a << 8 | b;
 	this.lookupOpcode(this.opcode);
 	// test 8 
 	this.reset();
 	console.log("TEST 8 : KEY INPUT");
 	var a = 0xe2;
 	var b = 0x9e;
 	this.opcode = a << 8 | b;
 	this.lookupOpcode(this.opcode);

}

Chip.prototype.cycle = function(){
         // Fetch Opcode
         this.lookupOpcode(this.opcode);
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




Chip.prototype.lookupOpcode = function(opcode){

	var convertedOp = ( opcode & 0xF000).toString(16);
	console.log("convertedOp = " + convertedOp + ", op = " + opcode);

	switch(convertedOp){
		case "a000" :  // ANNN
			this.I = opcode & 0xF000;
			console.log("ANNN " + this.I); 
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
		case "0" :		
			this.compareOpcodeZero(opcode);
		break;
		// Draw to Screen
		case "d000":
			this.drawScreen(opcode);
		break;

		case "e000":
			console.log("get keys");
			if(this.keypad[this.v[(opcode & 0x0F00 ) >> 8]] != 0){
				this.pc += 4;
			}else{
				this.pc += 2;
			}
		break;
		default:
			console.log("Unknown op code "+ opcode.toString(16));
	}

	convertedOp = ( opcode & 0xF00F ).toString(16);
	console.log("second op" + convertedOp);
	switch(convertedOp){
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
		case "f003":
			console.log("F003 "  + opcode +  " " + this.I);
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
	console.log("convertedOp = " + convertedOp + ", op = " + opcode);
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
