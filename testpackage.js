function TestPackage(){


}

function TestResult(testname, result  ){
    this.testname = testname;
    this.result = result;
}

TestPackage.prototype.testSuite = function() {
		// test one
	// ANNN 
	var a = 0x2F0
	var pcstart = chip.pc;
    chip.memory[chip.pc] = 0xA2;
    chip.memory[chip.pc + 1] = 0xF0;

    chip.opcode =  chip.memory[chip.pc] << 8 | chip.memory[chip.pc + 1]; 
    chip.fetch(chip.opcode);

    TESTS.push(a==chip.I && chip.pc == pcstart+2);


    // test two
    // test return from subrountine
    chip.reset();
    chip.memory[chip.pc] = 0x00;
    chip.memory[chip.pc + 1] = 0xEE;
  
    chip.opcode =  chip.memory[chip.pc] << 8 | chip.memory[chip.pc + 1]; 
    chip.fetch(chip.opcode);
    // console.log("pc" + chip.pc);
    // TESTS.push( )

    // test 3
    chip.reset();
 	var testop = 0x00e0;
 	chip.fetch( testop );

 	// test 4 

 	chip.reset();
 	var a = 0x20;
 	var b = 0x3f;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);

 	// test 5 
 	// 8XY4
 	chip.reset();
 	// console.log(" TEST 5 : ");
 	var a = 0x82;
 	var b = 0x34;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	//1000001000110100
 // & 1111000000000000
    chip.reset();
 	// console.log(" TEST 6 : 0xFX33  "  );
 	var a = 0xF2;
 	var b = 0x33;
 	chip.opcode = a << 8 | b;
 	chip.v[2] = 255;
 	chip.fetch(chip.opcode);
 	// test 7
 	chip.reset();
 	// console.log("TEST 7 : DXYN");
 	var a = 0xd2;
 	var b = 0x33;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	
    // test 8 
 	chip.reset();
 	// console.log("TEST 8 : KEY INPUT");
 	var a = 0xe2;
 	var b = 0x9e;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);

 	// test 9
 	// 1NNN
 	chip.reset();
 	// console.log("TEST 8 : jumpto");
 	var a = 0x12;
 	var b = 0x34;
 	chip.opcode = a << 8 | b;
 	var fecthed = chip.fetch(chip.opcode);

 	// test 10
 	// 3XNN
 	chip.reset();
 	// console.log("tEST 9 : vx to nn");

 	var pcstart = chip.pc;
 	chip.v[2] = 0x43;
 	var a = 0x32;
 	var b = 0x43;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push((pcstart+2) == chip.pc );


 	// test 11
 	// 7XNN
 	chip.reset();
 	chip.v[1] = 0x22;
 	var a = 0x71;
 	var b = 0x10;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[1]== 50 );

 	// test 12
 	// 8XY1  vx or vy
 	chip.reset();
 	chip.v[1] = 0xaa;
 	chip.v[2] = 0x55;
 	var a = 0x81;
 	var b = 0x21;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[1]== 255 );

 	// test 13
 	// 8XY2 vx AND vy
 	chip.reset();
 	chip.v[1] = 0x22;
 	chip.v[2] = 0x31
 	var a = 0x81;
 	var b = 0x22;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[1]== 32 );

 	// test 14
 	// 8XY3 vx XOR vy
 	chip.reset();
 	chip.v[1] = 0x22;
 	chip.v[2] = 0x31
 	var a = 0x81;
 	var b = 0x23;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[1]== 19 );

 	// test 15
 	// 8XY5
	chip.reset();
 	chip.v[4] = 0x32;
 	chip.v[5] = 0x16
 	var a = 0x84;
 	var b = 0x55;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[4]==28);

 	// test 16
 	// 8XY5
 	// see what happens when we go over
	chip.reset();
 	chip.v[5] = 0x32;
 	chip.v[4] = 0x16
 	var a = 0x84;
 	var b = 0x55;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	console.log(chip.v[4]);
 	TESTS.push(chip.v[4]==28);

    // test 17


 	// test 17
 	// 8X0E 	"800E":
 	// bit shift to the left
	chip.reset();
 	chip.v[5] = 0x32;
 	chip.v[4] = 0x16
 	var a = 0x84;
 	var b = 0x5E;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	console.log(chip.v[4]);
 	TESTS.push(chip.v[4]==44  );

	// Test 18
	// CXNN v[x] = random number & NN
 	chip.reset();
 	chip.v[4] = 0x16
 	var a = 0xC4;
 	var b = 0x1c;
 	chip.opcode = a << 8 | b;
 	chip.fetch(chip.opcode);
 	var randomnumber = chip.v[4];
 	chip.fetch(chip.opcode);
 	TESTS.push(chip.v[4] != randomnumber);
 	//do it again
 	// TESTS.push(chip.v[4]==44 && v[16] );

    // Test 19
    chip.reset();
    chip.v[0] = 0x10;
    var a = 0xB1;
    var b = 0x11;
    chip.opcode = a << 8 | b;
    chip.fetch(chip.opcode);
    TESTS.push(chip.pc==289);

 
};