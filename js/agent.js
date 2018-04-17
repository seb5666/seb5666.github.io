function Agent(board) {

}


Agent.prototype.maxAB = function(board, depth, alpha, beta) {
	if (depth === 0) {
		//console.log("LEAFMIN: " + this.value2(board));
		//this.printBoard(board);
		return [0,this.value6(board)];
	}
	//console.log("MaxAB: " + depth);

	var max = Number.MIN_SAFE_INTEGER;
	var bestDirection = -1;
	for(var d = 0; d<4; d++) {
		var nextBoard = this.move(board, d);
		if (nextBoard === false) {
			score = 0;
			//console.log("Stuck: " + d);
			//this.printBoard(board);
			continue;
		} else {
			score = this.minAB(this.move(board, d), depth, alpha, beta);
			//console.log("Score: " + score + " move: " + d);
			//this.printBoard(nextBoard);
		}
		if (score > max) {
			max = score;
			bestDirection = d;
		}

		//aplha-beta pruning
		if (max > beta) {
			return max;
		}
		if (max > alpha) {
			alpha = max;
		}
	}
	
	if (bestDirection < 0) {
		//game over...
		//still have to play...
		return [0,0];
	}

	//console.log(bestDirection + ": " + max);
	return [bestDirection, max];
}

Agent.prototype.minAB = function(board, depth, alpha, beta) {
	//console.log("MinAB: " + depth);
	var foundEmpty = false;
	var min = Number.MAX_SAFE_INTEGER;

	for (var x=0; x<4; x++) {
		for (var y=0; y<4; y++) {
			if (board[x][y] === 0) {
				foundEmpty = true;
				var copy = this.copyBoard(board);
				copy[x][y] = 2;
				var value = this.maxAB(copy, depth - 1, alpha, beta)[1];
				//console.log("Value: " + value);
				if (value < min) {
					//console.log("New min: " + min);
					min = value;
				}

				//aplha-beta pruning
				if (min < alpha) {
					return min;
				}
				if (min < beta) {
					beta = value;
				}
			}
		}
	}


	if (!foundEmpty) {
		min = 0;
	} 

	return min
}


Agent.prototype.max = function(board, depth) {
	if (depth === 0) {
		console.log("LEAF: " + this.value(board));
		this.printBoard(board);
		return [0,this.value(board)];
	}

	console.log("Max: " + depth);

	var max = Number.MIN_SAFE_INTEGER;
	var bestDirection = -1;
	for(var d = 0; d<4; d++) {
		var nextBoard = this.move(board, d);
		if (nextBoard === false) {
			score = 0;
			console.log("Stuck: " + d);
			this.printBoard(board);
			continue;
		} else {
			score = this.min(this.move(board, d), depth);
			console.log("Score: " + score + " move: " + d);
			this.printBoard(nextBoard);
		}
		if (score > max) {
			max = score;
			bestDirection = d;
		}
	}
	if (bestDirection < 0) {
		//game over...
		//still have to play...
		return [0,0];
	}
	console.log(bestDirection + ": " + max);
	return [bestDirection, max];
}

Agent.prototype.min = function(board, depth) {
	console.log("Min: " + depth);
	var foundEmpty = false;
	var min = Number.MAX_SAFE_INTEGER;

	for (var x=0; x<4; x++) {
		for (var y=0; y<4; y++) {
			if (board[x][y] === 0) {
				foundEmpty = true;
				var copy = this.copyBoard(board);
				copy[x][y] = 2;
				var value = this.max(copy, depth - 1)[1];
				console.log("Value: " + value);
				if (value < min) {
					//console.log("New min: " + min);
					min = value;
				}
			}
		}
	}

	if (!foundEmpty) {
		console.log("Not found an empty");
		return 0;
	} 

	return min
}

//Returns an evalution of how good the board is, for now just the number of free tiles..
Agent.prototype.value = function(board) {
	var value = 0;
	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] === 0) {
	      	value += 1;
	      }
	    }
	}
	return value;
}
//Returns an evalution of how good the board is
//This is the second trial: number of free tiles + 5 if the highest tile is in a corner
Agent.prototype.value2 = function(board) {
	var value = 0;
	var biggestTile = 0;
	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] === 0) {
	      	value += 1;
	      }
	      if (board[x][y] > biggestTile) {
	      	biggestTile = board[x][y];
	      }
	    }
	}

	if (board[0][0] === biggestTile || board[0][3] === biggestTile || board[3][0] === biggestTile || board[3][3] === biggestTile) {
		value += Math.floor(Math.log2(biggestTile)) * 10;
	}
	return value;
}

//Returns an evalution of how good the board is
//This is the third trial: higher tiles are worth more than 2 times the half tile
Agent.prototype.value3 = function(board) {
	//powers of three: 1 tile of value n is worth 3 tiles of value n-1
	var f = [1,3,9,27,81,243,729,2187,6561,19683,59049];
	var value = 0;
	var biggestTile = 0;

	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] > 0) {
	      	value += f[Math.floor(Math.log2(board[x][y])) - 1]
	      }
	    }
	}

	return value;
}

//Returns an evalution of how good the board is
//This is the 4th trial: higher tiles are worth more than 2 times the half tile and try to keep in corner
Agent.prototype.value4 = function(board) {
	//powers of three: 1 tile of value n is worth 3 tiles of value n-1
	var f = [1,3,9,27,81,243,729,2187,6561,19683,59049];
	var value = 0;
	var biggestTile = 0;

	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] > 0) {
	      	value += f[Math.floor(Math.log2(board[x][y])) - 1];
	      }
	      if (board[x][y] > biggestTile) {
	      	biggestTile = board[x][y];
	      }
	    }
	}

	if (board[0][0] === biggestTile || board[0][3] === biggestTile || board[3][0] === biggestTile || board[3][3] === biggestTile) {
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
	}
	return value;
}

//Returns an evalution of how good the board is
//This is the 5th trial: higher tiles are worth more than 2 times the half tile and try to keep in corner the highest tile and the second highest next to it
Agent.prototype.value5 = function(board) {
	//powers of three: 1 tile of value n is worth 3 tiles of value n-1
	var f = [1,3,9,27,81,243,729,2187,6561,19683,59049];
	var value = 0;
	var biggestTile = 0;
	var second = 0;

	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] > 0) {
	      	value += f[Math.floor(Math.log2(board[x][y])) - 1];
	      }
	      if (board[x][y] >= biggestTile) {
	      	second = biggestTile;
	      	biggestTile = board[x][y];
	      } else if (board[x][y] > second) {
	      	second = board[x][y];
	      }
	    }
	}

	var inCorner = false;
	if (board[0][0] === biggestTile) {
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[0][1] === second || board[1][0] === second) {
			value += f[Math.floor(Math.log2(biggestTile)) - 1];
		}
	} 
	if (board[0][3] === biggestTile){
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[0][2] === second || board[1][3] === second) {
			value += f[Math.floor(Math.log2(biggestTile)) - 1];
		}
	} 
	if (board[3][0] === biggestTile){
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[3][1] === second || board[2][0] === second) {
			value += f[Math.floor(Math.log2(biggestTile)) - 1];
		}
	}
	if (board[3][3] === biggestTile) {
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[2][3] === second || board[3][2] === second) {
			value += f[Math.floor(Math.log2(biggestTile)) - 1];
		}
	}
	return value;
}

//Returns an evalution of how good the board is
//This is the 6th trial: higher tiles are worth more than 2 times the half tile and try to keep in corner the highest tile and the second highest next to it and the third next to the second in a line
Agent.prototype.value6 = function(board) {
	//powers of three: 1 tile of value n is worth 3 tiles of value n-1
	var f = [1,3,9,27,81,243,729,2187,6561,19683,59049];
	var value = 0;
	var biggestTile = 0;
	var second = 0;
	var third = 0;

	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      if (board[x][y] > 0) {
	      	value += f[Math.floor(Math.log2(board[x][y])) - 1];
	      }
	      if (board[x][y] >= biggestTile) {
	      	third = second;
	      	second = biggestTile;
	      	biggestTile = board[x][y];
	      } else if (board[x][y] >= second) {
	      	third = second;
	      	second = board[x][y];
	      } else if (board[x][y] > third) {
	      	third = board[x][y]
	      }
	    }
	}

	var inCorner = false;
	var fbig = f[Math.floor(Math.log2(biggestTile)) - 1];
	if (board[0][0] === biggestTile) {
		value += fbig;
		if (board[0][1] === second){
			value += fbig;
			if (board[0][2] === third){
				value += fbig;
			}
		}
		if (board[1][0] === second) {
			value += fbig;
			if(board[2][0] === third) {
				value += fbig;
			}
		}
	} 
	if (board[0][3] === biggestTile){
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[0][2] === second){
			value += fbig;
			if (board[0][1] === third) {
				value += fbig;
			}
		} 
		if (board[1][3] === second) {
			value += fbig;
			if (board[2][3] === third) {
				value += fbig;
			}
		}
	} 
	if (board[3][0] === biggestTile){
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[3][1] === second) {
			value += fbig;
			if (board[3][2] === third) {
				value += fbig;
			}
		} 
		if (board[2][0] === second) {
			value += fbig;
			if (board[1][0] === third) {
				value += fbig;
			}
		}
	}
	if (board[3][3] === biggestTile) {
		value += f[Math.floor(Math.log2(biggestTile)) - 1];
		if (board[2][3] === second) {
			value += fbig;
			if (board[1][3] === third) {
				value += fbig;
			}
		}
		if (board[3][2] === second) {
			value += fbig;
			if (board[3][1] === third) {
				value += fbig;
			}
		}
	}
	return value;
}
Agent.prototype.copyBoard = function(b) {
	var board = []
	for(var x=0; x<4; x++) {
	    var row = []
	    for(var y=0; y<4; y++) {
	      row.push(b[x][y]);
	    }
		board.push(row);
	}
	return board;
}

Agent.prototype.score = function(board) {
	var score = 0;
	for(var x=0; x<4; x++) {
	    for(var y=0; y<4; y++) {
	      score += board[x][y];
	    }
	}
	return score;
}
Agent.prototype.move = function(b, direction) {
	
	//this.printBoard(board);
	//deep copy the board  
	var score = this.score(b);
	
	var board = this.copyBoard(b);

	var xs = [0,1,2,3];
	var ys = [0,1,2,3];
	var vector = {x:0, y:0};
	var self = this;
	//move up
	if (direction === 0) {
		vector.y = -1;
	}
	//move right
	if (direction === 1) {
		vector.x = 1;
		xs = xs.reverse()
	}
	//move down
	if (direction === 2) {
		vector.y = 1;
		ys = ys.reverse()
	}
	//move left
	if (direction === 3) {
		vector.x = -1;
	}

	var moved = false;
	//first move everything to the border
	for(var i=0; i<xs.length; i++) {
		x = xs[i];
		for(var j=0; j<ys.length; j++) {			
			y = ys[j];
			if (board[x][y]) {

				var currentX = x;
				var currentY = y;
				var nextX = x + vector.x;
				var nextY = y + vector.y;
				while (this.inBounds(nextX, nextY)) {
					if (board[nextX][nextY] === 0) {
						moved = true;
						board[nextX][nextY] = board[currentX][currentY];
						board[currentX][currentY] = 0;
					}
					currentX = nextX;
					currentY = nextY;
					nextX += vector.x;
					nextY += vector.y;
				}
			}
		}
	}

	//self.printBoard(board);

	//now merge when possible
	for(var i=0; i<xs.length; i++) {
		x = xs[i];
		for(var j=0; j<ys.length; j++) {			
			y = ys[j];
			if (board[x][y]) {
				var nextX = x - vector.x;
				var nextY = y - vector.y;
				if (self.inBounds(nextX, nextY) && board[x][y] === board[nextX][nextY]) {
					moved = true;
					board[x][y] *= 2;
					board[nextX][nextY] = 0;
					//shift remaining;
					var currentX = nextX;
					var currentY = nextY;
					var nextX = currentX - vector.x;
					var nextY = currentY - vector.y;
					while (self.inBounds(nextX, nextY)) {
						if (board[currentX][currentY] === 0) {
							board[currentX][currentY] = board[nextX][nextY];
							board[nextX][nextY] = 0;
						}
					currentX = nextX;
					currentY = nextY;
					nextX -= vector.x;
					nextY -= vector.y;
					}
				}
			}
		};
	};
	

	//check that no tiles have disapeared while moving...
	var score2 = this.score(board);

	if (score !== score2) {
		alert("Error while moving...");
		console.log("Error");
		self.printBoard(b);
		self.printBoard(board);
	}

	if (moved === false) {
		return false;
	}
	//self.printBoard(board);

	return board;
}

Agent.prototype.printBoard = function(board) {
	for(var y=0; y<4; y++) {
		var s = "";
		for(var x=0; x<4; x++) {
			s += (board[x][y] + " ");
		}
		console.log(s);
	}
	console.log("****");
}

Agent.prototype.inBounds = function(x,y) {
	return (x >= 0 && x < 4 && y >= 0 && y < 4);
}