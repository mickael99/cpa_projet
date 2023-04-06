const canvas = document.getElementById('window');
const ctx = canvas.getContext('2d');

let score = 0;  

//position serpent 
let xSnake = canvas.width / 2;
let ySnake = canvas.width / 2;

//stat serpent
let health = 5;
let velocity = 0.8;  
let dx = 0; 
let dy = 0;
let sizeSnake = 20;

//goutte d'eau
let xWaterDrop = 0;
let yWaterDrop = 0; 
let sizeWaterDrop = 30;
let isThere = false;

function gameOver() {
	//a coder
} 

function gameLoop() {
	initScreen();
	setTimeout(gameLoop, 1);
}

function initScreen() {
	const background = new Image();
	background.src = 'images/background.png'; 
	background.onload = initBackground(background);
} 

function initBackground(background) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	sapwnWaterDrop();
	initSnake();
	mooveSnake();
	if(checkCollisionWithBordureWindow()) {
		gameOver();
	}
}

function sapwnWaterDrop() {
	if(isThere == false) {
		xWaterDrop = Math.floor(Math.random() * (canvas.width - sizeWaterDrop));
		yWaterDrop = Math.floor(Math.random() * (canvas.height - sizeWaterDrop));
	}
	let waterDrop = new Image();  
	waterDrop.src = 'images/water_drop.png';
	waterDrop.onload = function() {
		ctx.drawImage(waterDrop, xWaterDrop, yWaterDrop, sizeWaterDrop, sizeWaterDrop);
	}
	isThere = true;
}

function initSnake() {
	ctx.fillStyle = 'black';
	ctx.fillRect(xSnake, ySnake, sizeSnake, sizeSnake);
}

function mooveSnake() {
	xSnake = xSnake + dx;
	ySnake = ySnake + dy;
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

document.body.addEventListener('keydown', pressKeyDown);

gameLoop();