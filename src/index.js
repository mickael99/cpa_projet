const canvas = document.getElementById('window');
const ctx = canvas.getContext('2d');
const button = document.querySelector("#restartButton");

//text
const scoreText = document.querySelector("#scoreText"); 
const healthText = document.querySelector("#healthText");

//musiques
const water_drop_sound = new Audio();
water_drop_sound.src = "sounds/water_drop.mp3";

const game_music = new Audio();
game_music.src = "sounds/desert.m4a";

const cactusSound = new Audio();
cactusSound.src = "sounds/cactus.mp3";

const gameOverMusic = new Audio();
gameOverMusic.src = "sounds/game_over.mp3";

const hearthMusic = new Audio();
hearthMusic.src = "sounds/hearth.mp3";

/*
const game_over_sound = new Audio();
game_over_sound.src = "no_life.m4a";
*/

let score = 0;  
let refresh = 8;

let isInvincible = false;

class snakePart {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class cactus {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class hearth {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

//position serpent 
let xSnake = canvas.width / 2;
let ySnake = canvas.height / 2;

//stat serpent
let health = 3;
let velocity = 20;  
let dx = 0; 
let dy = 0;
let sizeSnake = 20;
let snakeTail = [];
let sizeTail = 0;

//goutte d'eau
let xWaterDrop = 0;
let yWaterDrop = 0; 
let sizeWaterDrop = 40;
let isThere = false;

//cactus
let arrayCactus = [];
let sizeCactus = 40;
let nbCactus = 0;

//cactus
let arrayHearth = [];
let sizeHearth = 40;
let maxHearth = 0;
let nbHearth = 0;

function restart() {
	window.location.reload();
}

function gameOver(idTimeout) {
	clearTimeout(idTimeout);

	game_music.pause();

	ctx.font = "50px MV Boli";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	ctx.fillText("Game Over !", canvas.width / 2, canvas.height / 2);

	console.log("vitesse -> " + refresh);
	gameOverMusic.play();
} 

function gameLoop() {
	let idTimeout = setTimeout(gameLoop, 1000 / refresh);
	initScreen(idTimeout);
}

//pas encore dispo
function speed() {
	let random = Math.random(); 
	if(random > 0.3 && refresh < 30) { 
		refresh += 0.5;
	}
}

function initScreen(idTimeout) {
	const background = new Image(); 
	background.onload = initBackground(background, idTimeout);
} 

function initBackground(background, idTimeout) {
	game_music.play();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	background.src = 'images/background.png';
	ctx.drawImage(background, 0, 0, 
		canvas.width, canvas.height);
	
	if(checkCollisionWithWaterDrop()) {
		sizeTail++;
		isThere = false; 
		score++;
		scoreText.textContent = "Score: " + score;
		speed();
	}
	sapwnWaterDrop();

	let collisionCactus = checkCollisionWithCactus();
	if(collisionCactus != -1) {
		cactusSound.play();
		looseLife();
		arrayCactus.splice(collisionCactus, 1);
		nbCactus--;
	}
	spawnCactus();
	initSnake();
	spawnSnakePart();
	mooveSnake();
	if(checkCollisionWithBordureWindow() ||
		checkCollisionWithTail() || 
		health <= 0) {
		gameOver(idTimeout);
	}
	//printCoordonne();
}

function looseLife() {
	health--;
	healthText.textContent = "Vie: " + health;
}

function spawnHearth() {
	if(nbHearth < maxHearth) {
		do {
			let newHearth = new hearth(Math.floor(Math.random() * (canvas.width - sizeCactus)),
				Math.random() * (canvas.height - sizeCactus));
			
		}while(checkCollisionWithTwoSquares(newHearth.x, newHearth.y, sizeHearth,
				xSnake - 50, ySnake - 50, sizeSnake + 100) &&
				checkCollisionWithTwoSquares(newHearth.x, newHearth.y, sizeHearth,
				xWaterDrop - 10, yWaterDrop - 10, sizeWaterDrop + 20));
	}
}

function spawnCactus() {
	//ajout nouveau cactus
	let maxCactus = Math.floor(score / 10);
	if(nbCactus < maxCactus) {
		do
			newCactus = new cactus(Math.floor(Math.random() * (canvas.width - sizeCactus)),
												Math.random() * (canvas.height - sizeCactus));
		while(checkCollisionWithTwoSquares(newCactus.x, newCactus.y, sizeCactus,
				xSnake - 50, ySnake - 50, sizeSnake + 100) &&
			  checkCollisionWithTwoSquares(newCactus.x, newCactus.y, sizeCactus,
				xWaterDrop - 10, yWaterDrop - 10, sizeWaterDrop + 20));
		arrayCactus.push(newCactus);
		nbCactus++;
	}
	
	//affichage de tous les cactus
	for(let i = 0; i < arrayCactus.length; i++) {
		let cactusImage = new Image();
		cactusImage.src = "images/cactus.png";

		cactusImage.onload = function() {
			ctx.drawImage(cactusImage, arrayCactus[i].x, 
				arrayCactus[i].y, sizeCactus, sizeCactus);
		}
	}
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

function checkCollisionWithTwoSquares(x1, y1, size1, x2, y2, size2) {
	if((x1 + size1 > x2) && 
		(x1 < x2 + size2) &&
		(y1 + size1 > y2) &&
		(y1 < y2 + size2)) {
			return true;
	}
	return false;
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
	if(checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake, xWaterDrop, yWaterDrop, sizeWaterDrop)) {
		water_drop_sound.pause();
		setTimeout(function() {
			water_drop_sound.play();
		}, 100);
		return true;
	}
	return false;
}

function checkCollisionWithHeart() {
	for(let i = 0; i < arrayHearth.length; i++) {
		if(checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake,
								 			arrayHearth[i].x, arrayHearth[i].y, sizeHearth))
			return i;
	}
	return -1;
}

function checkCollisionWithCactus() {
	console.log("taille -> " + arrayCactus.length);
	for(let i = 0; i < arrayCactus.length; i++) {
		console.log("erreur !");
		if(checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake, 
											arrayCactus[i].x, arrayCactus[i].y, sizeCactus)) {
			console.log("collision avec " + i);
			return i;
		}
	}
	return -1;
}

function checkCollisionWithTail() {
	for(let i = 0; i < snakeTail.length; i++) {
		if((xSnake + sizeSnake > snakeTail[i].x) &&
			(xSnake < snakeTail[i].x + sizeSnake) &&
			(ySnake  < snakeTail[i].y + sizeSnake) &&
			(ySnake + sizeSnake > snakeTail[i].y)) {
				return true;
		}
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