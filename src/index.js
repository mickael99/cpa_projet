const canvas = document.getElementById('window');
const ctx = canvas.getContext('2d');

class snakePart {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

let score = 0;  

//position serpent 
let xSnake = canvas.width / 2;
let ySnake = canvas.width / 2;

let refresh = 8;

//stat serpent
let health = 5;
let velocity = 20;  
let dx = 0; 
let dy = 0;
let sizeSnake = 20;
let snakeTail = [];
let sizeTail = 0;

//goutte d'eau
let xWaterDrop = 0;
let yWaterDrop = 0; 
let sizeWaterDrop = 30;
let isThere = false;

function gameOver() {
	clearTimeout(id);
} 

function gameLoop() {
	initScreen();
	let id = setTimeout(gameLoop, 1000 / refresh);
}

//pas encore dispo
function speed() {
	let random = Math.random(); 
	if(random > 0.5) { 
		velocity += 1;
	}
}

function initScreen() {
	const background = new Image(); 
	background.onload = initBackground(background);
} 

function initBackground(background) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	background.src = 'images/background.png';
	ctx.drawImage(background, 0, 0, 
		canvas.width, canvas.height);
	
	if(checkCollisionWithWaterDrop()) {
		sizeTail++;
		isThere = false; 
		score++;
		//speed();
	}
	sapwnWaterDrop();
	initSnake();
	spawnSnakePart();
	mooveSnake();
	if(checkCollisionWithBordureWindow()) {
		gameOver();
	}
	printCoordonne();
}

function sapwnWaterDrop() {
	if(isThere == false) {
		xWaterDrop = Math.floor(Math.random() * 
			(canvas.width - sizeWaterDrop));
		yWaterDrop = Math.floor(Math.random() * 
			(canvas.height - sizeWaterDrop));
	}
	
	let waterDrop = new Image();  
	waterDrop.src = 'images/water_drop.png';
	waterDrop.onload = function() {
		ctx.drawImage(waterDrop, xWaterDrop, 
			yWaterDrop, sizeWaterDrop, sizeWaterDrop);
	}
	isThere = true;
}

function initSnake() {
	ctx.fillStyle = 'black';
	ctx.fillRect(xSnake, ySnake, sizeSnake, sizeSnake);
}

function spawnSnakePart() {
	ctx.fillStyle = 'green';
	//init de toutes les parties de la queue du serpent sauf la première queue
	if(sizeTail > snakeTail.length && sizeTail > 1) {
		let lastIndex = snakeTail.length - 1;
		snakeTail.push(new snakePart(snakeTail[lastIndex].x, 
			snakeTail[lastIndex].y));
	}

	//deplacement de toutes les parties du serpent sauf la tête 
	for(let i = snakeTail.length - 1; i >= 0; i--) {
		if(i == 0) {
			ctx.fillRect(snakeTail[i].x, snakeTail[i].y, sizeSnake, sizeSnake);
			snakeTail[i].x = xSnake;
			snakeTail[i].y = ySnake;
		}
		else {
			ctx.fillRect(snakeTail[i].x, snakeTail[i].y, sizeSnake, sizeSnake);
			snakeTail[i].x = snakeTail[i - 1].x;
			snakeTail[i].y = snakeTail[i - 1].y;
		}
	}

	if(sizeTail == 1 && sizeTail > snakeTail.length) {
		snakeTail.push(new snakePart(xSnake, ySnake));
	}

	//console.log("length -> " + snakeTail.length);
	//console.log("size -> " + sizeTail);
}

function mooveSnake() {
	xSnake +=  dx;
	ySnake += dy;
}

function checkCollisionWithBordureWindow() {
	//colision avec le haut de la fenetre
	if(ySnake < 0)
		return true;

	//colision avec le bas de la fenetre
	if(ySnake + sizeSnake > canvas.height)
		return true;

	//collision avec le coté gauche de la fenêtre
	if(xSnake < 0)
		return true; 

	//collision avec le coté droit de la fenêtre
	if(xSnake + sizeSnake > canvas.width)
		return true; 

	return false;
}

function checkCollisionWithWaterDrop() {
	if((xWaterDrop - xSnake < sizeSnake) && 
		(xSnake - xWaterDrop < sizeSnake) &&
		(ySnake + sizeSnake > yWaterDrop) &&
		(ySnake < yWaterDrop + sizeWaterDrop)) {
			return true;
	}
	return false;
}

function pressKeyDown() {
	//touche du haut 
	if(event.keyCode == 38 && dy <= 0) {
		dx = 0; 
		dy = -velocity;  
	}

	//touche du bas 
	if(event.keyCode == 40 && dy >= 0) {
		dx = 0; 
		dy = velocity;  
	}

	//touche de gauche 
	if(event.keyCode == 37 && dx <= 0) {
		dx = -velocity; 
		dy = 0;  
	}

	//touche de droite 
	if(event.keyCode == 39 && dx >= 0) {
		dx = velocity; 
		dy = 0;  
	}
}

function printCoordonne() {
	for(let i = 0; i < snakeTail.length; i++) {
		console.log("numéro " + i);
		console.log("	x -> " + snakeTail[i].x);
		console.log("	y -> \n" + snakeTail[i].y);
	}
}

document.body.addEventListener('keydown', pressKeyDown);

gameLoop();