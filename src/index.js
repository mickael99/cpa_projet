const canvas = document.getElementById('window');
const ctx = canvas.getContext('2d');
const button = document.querySelector("#restartButton");

//text
const scoreText = document.querySelector("#scoreText"); 
const healthText = document.querySelector("#healthText");

//musiques
const waterDropSound = new Audio();
waterDropSound.src = "sounds/water_drop.mp3";

const gameMusic = new Audio();
gameMusic.src = "sounds/desert.m4a";

const cactusSound = new Audio();
cactusSound.src = "sounds/cactus.mp3";

const gameOverMusic = new Audio();
gameOverMusic.src = "sounds/game_over.mp3";

const hearthMusic = new Audio();
hearthMusic.src = "sounds/hearth.mp3";

//score et vitesse de rafraichissement
let score = 0;  
let refresh = 8;

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

//serpent
let xSnake = canvas.width / 2;
let ySnake = canvas.height / 2;
let health = 3; 
let dx = 0; //1 si il va a droite, -1 si il va à gauche, 0 sinon 
let dy = 0; //1 si il va en bas, -1 si il va en haut, 0 sinon
let sizeSnake = 20;
let snakeTail = [];
let sizeTail = 0;

//goutte d'eau(spawn instantané)
let xWaterDrop = 0;
let yWaterDrop = 0; 
let sizeWaterDrop = 40;
let waterIsThere = false; //vrai si la goutte d'eau est toujours sur l'écran

//cactus(1 cactus supplémentaire tous les 10 points)
let arrayCactus = [];
let sizeCactus = 40;
let nbCactus = 0; //nombre de cactus présents dans le jeu

//coeur(1 / 3 chance qu'un coeur apparaisse tous les 20 points)
let xHearth = 0;
let yHearth = 0;
let sizeHearth = 40;
let hearthIsThere = false; //vrai si le coeur est présent dans le jeu
let isHearthSpawnOnce = false; //vrai si on a déja tenté de faire apparaître le coeur

/**
 * redémarre le jeu
 */
function restart() {
	window.location.reload();
}


/**
 * gestion du game over
 * 	-> musique du game over
 * 	-> affichage texte game over *
 * 
 * @param idTimeout identifiant du setTimeout qui appel la boucle du jeu
 */
function gameOver(idTimeout) {
	clearTimeout(idTimeout);

	gameMusic.pause();

	ctx.font = "50px MV Boli";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	ctx.fillText("Game Over !", canvas.width / 2, canvas.height / 2);

	gameOverMusic.play();
} 

/**
 * Boucle principal du jeu 
 */
function gameLoop() {
	let idTimeout = setTimeout(gameLoop, 1000 / refresh);
	initScreen(idTimeout);
}

/**
 * Créé l'image de fond du jeu
 * @param idTimeout identifiant du setTimeout qui appel la boucle du jeu
 */
function initScreen(idTimeout) {
	const background = new Image(); 
	background.onload = gameManage(background, idTimeout);
} 

/**
 * Gere l'affichage des images, les collisions, le game over
 * @param background l'image de fond du jeu  
 * @param idTimeout identifiant du setTimeout qui appel la boucle du jeu
 */
function gameManage(background, idTimeout) {
	//gestion de la musique du jeu
	if(document.visibilityState == 'visible')
		gameMusic.play();

	//affichage de la tête du serpent et de l'image de fond
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	background.src = 'images/background.png';
	ctx.drawImage(background, 0, 0, 
		canvas.width, canvas.height);
	
	/**
	 * collision avec une goutte d'eau 
	 * 	-> on augmente la taille du serpent 
	 * 	-> on incrémente le score
	 * 	-> on augmente la vitesse
	 */
	if(checkCollisionWithWaterDrop()) {
		sizeTail++;
		waterIsThere = false; 
		score++;
		scoreText.textContent = "Score: " + score;
		speed();
	}

	/**
	 * collision avec un coeur 
	 * 	-> incrémente le nombre de point de vie
	 */
	if(checkCollisionWithHeart())
		getLife();
	
	/**
	 * collision avec un cactus (attention, il peut y avoir plusieurs cactus dans le jeu
	 * 	-> on perd une vie 
	 * 	-> on fait réapparaitre le cactus à un autre emplacement
	 */
	let collisionCactus = checkCollisionWithCactus();
	if(collisionCactus != -1) {
		looseLife();
		arrayCactus.splice(collisionCactus, 1);
		nbCactus--;
	}

	//dessin des images
	sapwnWaterDrop();
	spawnCactus();
	spawnHearth();
	initSnake();
	spawnSnakePart();

	//mouvement du serpent
	mooveSnake();

	/**
	 * game over
	 * 	-> si il y a collision avec la bordure de l'écran
	 * 	-> si le joueur n'a plus de vie 
	 * 	-> si la tête du serpent touche l'une de ses parties
	 */
	if(checkCollisionWithBordureWindow() ||
		checkCollisionWithTail() || 
		health <= 0) {
		gameOver(idTimeout);
	}
}

/**
 * A chaque point gagné, le serpent à une chance sur 3 de prendre de la vitesse
 * La vitesse est limité à 30
 */
function speed() {
	let random = Math.random(); 
	if(random > 0.333 && refresh < 30) { 
		refresh += 0.5;
	}
}

/**
 * décrémente le nombre de point de vie et l'affiche
 */
function looseLife() {
	health--;
	healthText.textContent = "Vie: " + health;
}

/**
 * incrémente le nombre de point de vie et l'affiche
 */
function getLife() {
	health++;
	healthText.textContent = "Vie: " + health;
}

/**
 * le coeur a 1 chance sur 3 de spawner tous les 20 points
 */
function spawnHearth() {
	let rand = Math.random();
	if(!isHearthSpawnOnce && !hearthIsThere && 
			score > 0 && score % 20 == 0 && rand < 0.333) {
		hearthIsThere = true;
		//on évite les collisions avec le serpent, la goutte d'eau et les cactus
		do {
			xHearth = Math.floor(Math.random() * (canvas.width - sizeCactus));
			yHearth = Math.floor(Math.random() * (canvas.height - sizeCactus));
		} while(checkCollisionWithTwoSquares(xHearth, yHearth, sizeHearth,
				xSnake - 50, ySnake - 50, sizeSnake + 100) &&
				checkCollisionWithTwoSquares(xHearth, yHearth, sizeHearth,
				xWaterDrop - 10, yWaterDrop - 10, sizeWaterDrop + 20) && 
				checkCollisionWithOneSquareAndAnArray(xHearth - 10, yHearth - 10, sizeHearth + 20,
					arrayCactus, sizeCactus));
	}

	//1 seul essai pour le coeur spawn
	if(score > 0 && score % 20 == 0 && !isHearthSpawnOnce)
		isHearthSpawnOnce = true;

	if(hearthIsThere) {
		//dessin 
		let hearthImage = new Image();
		hearthImage.src = "images/hearth.png";	
		hearthImage.onload = function() {
			ctx.drawImage(hearthImage, xHearth, yHearth, sizeHearth, sizeHearth);
		}	
		console.log("spawn d'un coeur");
	}

	//on bloque la génération d'un coeur
	if(score % 20 == 1 && score > 1) {
		isHearthSpawnOnce = false;
		hearthIsThere = false;
	}
}

/**
 * un cactus spawn forcément tous les 10 points et change de position si 
 * le serpent le touche
 */
function spawnCactus() {
	//ajout nouveau cactus
	let maxCactus = Math.floor(score / 10);
	if(nbCactus < maxCactus) {
		//on évite les collisions avec le serpent, la goutte d'eau et les cactus 
		do
			newCactus = new cactus(Math.floor(Math.random() * (canvas.width - sizeCactus)),
												Math.random() * (canvas.height - sizeCactus));
		while(checkCollisionWithTwoSquares(newCactus.x, newCactus.y, sizeCactus,
				xSnake - 100, ySnake - 100, sizeSnake + 200) &&
			  checkCollisionWithTwoSquares(newCactus.x, newCactus.y, sizeCactus,
				xWaterDrop - 10, yWaterDrop - 10, sizeWaterDrop + 20) &&
			  checkCollisionWithOneSquareAndAnArray(newCactus.x - 10, newCactus.y - 10, sizeCactus + 20,
					arrayCactus, sizeCactus));
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

/**
 * des que le joueur récupère une goutte d'eau, une nouvelle apparait
 */
function sapwnWaterDrop() {
	if(waterIsThere == false) {
		//on évite les collisions avec le serpent (j'ai choisi de me limiter à cela)
		do {
			xWaterDrop = Math.floor(Math.random() * 
				(canvas.width - sizeWaterDrop));
			yWaterDrop = Math.floor(Math.random() * 
				(canvas.height - sizeWaterDrop));
		}while(checkCollisionWithOneSquareAndAnArray(xWaterDrop - 10, yWaterDrop - 10, sizeWaterDrop + 20,
			arrayCactus, sizeCactus));
	}

	let waterDrop = new Image();  
	waterDrop.src = 'images/water_drop.png';
	
	waterDrop.onload = function() {
		ctx.drawImage(waterDrop, xWaterDrop, 
			yWaterDrop, sizeWaterDrop, sizeWaterDrop);
	}
	waterIsThere = true;
}

/**
 * dessine la tête du serpent qui représente un carré noir
 */
function initSnake() {
	ctx.fillStyle = 'black';
	ctx.fillRect(xSnake, ySnake, sizeSnake, sizeSnake);
}

/**
 * dessine les parties du serpent
 */
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
}

/**
 * déplace la tête du serpent
 */
function mooveSnake() {
	xSnake +=  dx;
	ySnake += dy;
}

/**
 * retourne vrai si le carré est en collision avec au moins une image de la liste
 * @param x absice du carré
 * @param y ordonné du carré 
 * @param sizeSquare taille du carré
 * @param arraySquares liste
 * @param sizeElementOfArray taille de chaque élément de l'image 
 */
function checkCollisionWithOneSquareAndAnArray(x, y, sizeSquare, arraySquares, sizeElementOfArray) {
	for(let i = 0; i < arraySquares.length; i++) {
		if(checkCollisionWithTwoSquares(x, y, sizeSquare, arraySquares[i].x, arraySquares[i].y, sizeElementOfArray))
			return true;
	}
	return false;
}

/**
 * vrai si il ya une collision avec les 2 élements
 * @param x1 
 * @param y1 
 * @param size1 
 * @param x2 
 * @param y2 
 * @param size2 
 */
function checkCollisionWithTwoSquares(x1, y1, size1, x2, y2, size2) {
	if((x1 + size1 > x2) && 
		(x1 < x2 + size2) &&
		(y1 + size1 > y2) &&
		(y1 < y2 + size2)) {
			return true;
	}
	return false;
}

/**
 * vrai si le serpent est en collision avec la bordure de l'écran
 */
function checkCollisionWithBordureWindow() {
	//colision avec le haut de la fenetre
	if(ySnake < 0 || 
		ySnake + sizeSnake > canvas.height ||
		xSnake < 0 ||
		xSnake + sizeSnake > canvas.width)
			return true;
	return false;
}

/**
 * vrai si la tête du serpent est en collision avec une goutte d'eau
 */
function checkCollisionWithWaterDrop() {
	if(checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake, xWaterDrop, yWaterDrop, sizeWaterDrop)) {
		waterDropSound.pause();
		waterDropSound.play();
		return true;
	}
	return false;
}

/**
 * vrai si la tête du serpent est en collision avec un coeur
 */
function checkCollisionWithHeart() {
	if(hearthIsThere && checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake,
									 xHearth, yHearth, sizeHearth)) {
		hearthMusic.play();
		hearthIsThere = false;
		//important pour ne pas que le coeur soit présent dans le jeu de maniere physique
		xHearth = -100;
		yHearth = -100;
		return true;
	}
	return false;
}

/**
 * si la tête du serpent est en collision avec l'un des cactus, l'algo renvoie 
 * l'indice en question
 * renvoie -1 sinon
 */
function checkCollisionWithCactus() {
	for(let i = 0; i < arrayCactus.length; i++) {
		if(checkCollisionWithTwoSquares(xSnake, ySnake, sizeSnake, 
											arrayCactus[i].x, arrayCactus[i].y, sizeCactus)) {
			cactusSound.play();
			return i;
		}
	}
	return -1;
}

/**
 * vrai si la tête du serpent est en collision avec l'une de ses parties 
 */
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

/**
 * gestion des fleches directionnelles
 */
function pressKeyDown() {
	//touche du haut 
	if(event.keyCode == 38 && dy <= 0) {
		dx = 0; 
		dy = -sizeSnake;  
	}

	//touche du bas 
	if(event.keyCode == 40 && dy >= 0) {
		dx = 0; 
		dy = sizeSnake;  
	}

	//touche de gauche 
	if(event.keyCode == 37 && dx <= 0) {
		dx = -sizeSnake; 
		dy = 0;  
	}

	//touche de droite 
	if(event.keyCode == 39 && dx >= 0) {
		dx = sizeSnake; 
		dy = 0;  
	}
}

document.body.addEventListener('keydown', pressKeyDown);

gameLoop();