let canvas = document.getElementById("poolTable");
let ctx = canvas.getContext("2d");

let click = false;
let mousePos = {x: 0, y: 0};
$('#poolTable').mousemove(function(e) {
	mousePos.x = e.pageX - this.offsetLeft;
	mousePos.y = e.pageY - this.offsetTop;
});
$('#poolTable').click(function(e) {
	click = true;
});

function draw(board, border, ballRadius, balls, holeRadius, holes) {	
	//BOARD
	ctx.fillStyle = board.borderColor;
	ctx.fillRect(0, 0, 1000, 500);

	ctx.fillStyle = board.color
	ctx.fillRect(border, border, board.x - border * 2, board.y - border * 2);

	//HOLES
	ctx.fillStyle = 'black';
	ctx.strokeStyle = 'black';

	for(let i = 0; i < holes.length; i++) {
		drawEllipse(holes[i].x, holes[i].y, holeRadius);
	}

	//BALLS
	for(let i = 0; i < balls.length; i++) {
		ctx.fillStyle = balls[i].color;
		ctx.strokeStyle = balls[i].color;
		drawEllipse(balls[i].x, balls[i].y, ballRadius);
	}
}

function drawEllipse(x, y, radius) {
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
	ctx.fill()
	ctx.stroke();
} 

function toRad(degrees) {
	return (degrees * Math.PI) / 180;
}

function toDeg(rad) {
	return rad * (180 / Math.PI);
}

function simplifyAngle(degrees) {
	while(degrees < 0) {
		degrees += 360
	}
	while(degrees > 360) {
		degrees -= 360
	}
	return degrees;
}

function getDistance1D(x, y) {
	if(x >= y) {
		return x - y;
	} else {
		return y - x;
	}
}

function getDistance(pos1, pos2) {
	let distance = {x: getDistance1D(pos1.x, pos2.x), y: getDistance1D(pos1.y, pos2.y)}
	return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2))
}

function move(board, border, ballRadius, balls, holeRadius, holes, friction) {
	for(let i = 0; i < balls.length; i++) {
		balls[i].direction = simplifyAngle(balls[i].direction);
		let newPos = {
			x: balls[i].x + Math.cos(toRad(balls[i].direction)) * balls[i].speed,
			y: balls[i].y + Math.cos(toRad(90 - balls[i].direction)) * balls[i].speed
		}

		balls[i].x = newPos.x;
		balls[i].y = newPos.y;

		//BALL TO BALL COLLISION
		for(let j = 0; j < balls.length; j++) {
			if(i != j && getDistance(newPos, balls[j]) < ballRadius * 2) {
				balls[j].direction = getLineAngle(newPos, balls[j]);
				balls[j].speed = balls[i].speed * 1;
				
				balls[i].direction = getLineAngle(newPos, balls[j]) + 180;
				//balls[i].speed = 0;
			}
		}

		//WALL COLLISION
		if(newPos.x - ballRadius < border) {
			balls[i].direction = (balls[i].direction + 180) * -1;
			balls[i].x = border + ballRadius;	
		} else if(newPos.x + ballRadius > board.x - border) {
			balls[i].direction = (balls[i].direction + 180) * -1;
			balls[i].x = board.x - border - ballRadius;	
		} else if(newPos.y - ballRadius < border) {
			balls[i].direction = balls[i].direction * -1;
			balls[i].y = border + ballRadius;	
		} else if(newPos.y + ballRadius > board.y - border) {
			balls[i].direction = balls[i].direction * -1;
			balls[i].y = board.y - border - ballRadius;
		}

		//CHECK IF BALL IN HOLE
		for(let j = 0; j < holes.length; j++) {
			if(i != 0 && getDistance(balls[i], holes[j]) < holeRadius) {
				balls[i].x = 2000;
				balls[i].speed = 0;
			}
		}

		balls[i].speed *= friction;

		if(balls[i].speed.x < 0) {
			balls[i].speed.x = 0;
		}
		if(balls[i].speed.y < 0) {
			balls[i].speed.y = 0;
		}
	}

	return balls;
} 

function getLineAngle(pos1, pos2) {
	let a = pos2.y - pos1.y;
	let b = pos2.x - pos1.x;

	if(pos2.x > pos1.x) {
		return simplifyAngle(toDeg(Math.atan(a/b)));
	} else {
		return simplifyAngle(toDeg(Math.atan(a/b)) + 180);
	}
}

function getShotPower(mousePos, ball) {
	return getDistance(mousePos, ball) / 10;	
}

function addBall(balls, x, y, color) {
	balls.push({
		color: color,
		x: x,
		y: y,
		speed: 0,
		direction: 0
	})
}

function startGame() {
	let board = {x:1000, y: 500, color: 'green', borderColor: 'black'};
	let border = 20;

	let friction = 0.98;

	let ballRadius = 20;
	let balls = [];
	addBall(balls, 750, 250, 'white');
	for(let x = 1; x < 20; x++) {
		for(let y = 1; y < 10; y++) {
			addBall(balls, x * 100, y * 100, 'red');
		}
	}
	
	let holeOffset = 10;
	let holeRadius = 40;
	let holes = [];
	holes.push({x: border + holeOffset, y: border + holeOffset});
	holes.push({x: board.x / 2, y: border});
	holes.push({x: board.x - border - holeOffset, y: border + holeOffset});

	holes.push({x: border + holeOffset, y: board.y - border - holeOffset});
	holes.push({x: board.x / 2, y: board.y - border});
	holes.push({x: board.x - border - holeOffset, y: board.y - border - holeOffset});

	setInterval(function() {
		draw(board, border, ballRadius, balls, holeRadius, holes);
		
		let shotAngle = Math.round(getLineAngle(balls[0], mousePos));
		let shotPower = Math.round(getShotPower(mousePos, balls[0]));

		ctx.fillStyle = 'white';
		ctx.font = "20px Arial";
		ctx.fillText('Angle: ' + shotAngle + ' Power: ' + shotPower, 5, 25);

		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 4;

		ctx.beginPath();
		ctx.moveTo(balls[0].x, balls[0].y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();

		if(click) {
			click = false;
			//if(balls[0].speed < 0.5) {
				balls[0].direction = shotAngle;
				balls[0].speed = shotPower;
			//}
		} 
		
		balls = move(board, border, ballRadius, balls, holeRadius, holes, friction);
	}, (1000 / 60))
}

startGame();


