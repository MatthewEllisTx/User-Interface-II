var canvasBoard = document.getElementById('board');
var board = canvasBoard.getContext('2d');
var canvasGame = document.getElementById('game');
var ctxGame = canvasGame.getContext('2d');

const lightGreen = '#aad751';
const darkGreen = '#a2d149';
const darkerGreen = '#578a34';
const darkestGreen = '#4a752c';

alert('This page contains flashing colors, and is rather ugly');

//gets window size
var x;
var y;
function viewport(){
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )){
        a = 'client';
        e = document.documentElement || document.body;
    }
    x = e[a+'Width'];
    y = e[a+'Height'];
    canvasBoard.width = Math.floor(x/3/17)*17-2;
    canvasBoard.height = Math.floor(x/3/17)*17-2;
    canvasGame.width = Math.floor(x/3/17)*17-2;
    canvasGame.height = Math.floor(x/3/17)*17-2;
    drawGrid();
    document.getElementById('window size').innerHTML = 'Width x Height: ' + x + ' x ' + y;
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}
viewport();
//document.getElementById('window size').innerHTML = JSON.stringify(viewport());

//detects change in window size
function addEvent(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};
addEvent(window, "resize", viewport);

//stops updating window size
function removeEvent(object, type, callback){
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.removeEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.detachEvent("on" + type, callback);
    } else {
        object["on"+type] = undefined;
    }
}

//draws grid
var squareSize;
var headerSize;
function drawGrid(){
    squareSize = Math.floor(x/3/17);
    headerSize = Math.floor(x/3) - 15*squareSize;
    board.fillStyle = darkerGreen;
    board.fillRect(0, 0, x/3, headerSize);
    
    board.fillStyle = lightGreen;
    for(let i = 0; i < 17; i++){
        for(let j = 0; j < 15; j++){
            board.fillRect(i*squareSize, j*squareSize+headerSize, squareSize, squareSize);
            board.fillStyle = (board.fillStyle == lightGreen) ? darkGreen : lightGreen;
        }
    }
}

var started = false;
var timer;
var timePerFrame = 7;
var divisions = 10; //timePerFrame 7 and 20 divisions should ensure 140ms per block
var counter = 0;
var d = new Date();
var n = d.getTime();

var direction = 2;
var nextX;
var nextY;
var snake1;
var dead = false;
function startGameLoop(){
    direction = 2;
    snake1 = setUpSnake();
    makeApple(snake1);
    timer = setTimeout(gameLoop, timePerFrame);
}

//main game loop
function gameLoop(){
    n = d.getTime() + timePerFrame;
    drawSnake(snake1);
    counter++;
    if(counter > divisions){
        snakeMath(snake1);
        counter = 0;
    }
    //ctxGame.globalCompositeOperation = 'destination-out';
    if(dead){
        started = false;
        dead = false;
        return;
    }
    if(n - d.getTime() > 0){
        timer = setTimeout(gameLoop, n - d.getTime());
    } else{
        gameLoop();
    }
}

//come on this one is pretty descriptive
//but it also draws the apple because
var offset = 0;
var image = new Image();
image.src = 'android-chrome-256x256.png';
function drawSnake(snake){
    //clear previous
    ctxGame.clearRect(0, 0, x, y);
    //draw tail
    ctxGame.fillStyle = 'black';
    if(shrink){
        if(snake[2] == 1){
            //up
            ctxGame.fillRect(snake[0], snake[1], squareSize, squareSize-offset);
        } else if(snake[2] == 2){
            //right
            ctxGame.fillRect(snake[0] + offset, snake[1], squareSize-offset, squareSize);
        } else if(snake[2] == 3){
            //down
            ctxGame.fillRect(snake[0], snake[1] + offset, squareSize, squareSize-offset);
        } else if(snake[2] == 4){
            //left
            ctxGame.fillRect(snake[0], snake[1], squareSize-offset, squareSize);
        }
    } else{
        ctxGame.fillRect(snake[0], snake[1], squareSize, squareSize);
    }
    //draw head
    if(snake[snake.length-1] == 1){
        ctxGame.fillRect(snake[snake.length-3], snake[snake.length-2] - offset, squareSize, squareSize + offset);
    } else if(snake[snake.length-1] == 2){
        ctxGame.fillRect(snake[snake.length-3], snake[snake.length-2], squareSize + offset, squareSize);
    } else if(snake[snake.length-1] == 3){
        ctxGame.fillRect(snake[snake.length-3], snake[snake.length-2], squareSize, squareSize + offset);
    } else if(snake[snake.length-1] == 4){
        ctxGame.fillRect(snake[snake.length-3] - offset, snake[snake.length-2], squareSize + offset, squareSize);
    }
    offset += squareSize/divisions;
    //draw body
    for(let i = 3; i < snake.length-3; i += 3){
        ctxGame.fillRect(snake[i], snake[i+1], squareSize, squareSize);
    }
    
    //For some unknow reason drawing a circle will not work both in clearing it and eating it
    //but a png will
    /*ctxGame.fillStyle = 'red';
    ctxGame.beginPath();
    ctxGame.arc(appleY+squareSize/2+1, appleY+squareSize/2+1, squareSize/2, 0, 2*Math.PI, false);
    ctxGame.fill();*/
    ctxGame.drawImage(image, appleX, appleY, squareSize, squareSize);
}

//updates snake position
var shrink = true;
function snakeMath(snake){
    offset = 0;
    if(shrink){
        snake.shift();
        snake.shift();
        snake.shift();
    } else{
        shrink = true;
    }
    snake.push(nextX);
    snake.push(nextY);
    snake.push(direction);

    if(direction == 1){
        nextY -= squareSize;
    } else if(direction == 2){
        nextX += squareSize;
    } else if(direction == 3){
        nextY += squareSize;
    } else{
        nextX -= squareSize;
    }
    checkDeath(snake);
    checkApple(snake);
}

function checkDeath(snake){
    //check walls
    if(nextX < 0 || nextX > squareSize*16){
        dead = true;
        return;
    }
    if(nextY < squareSize*2 || nextY > squareSize*17){
        dead = true;
        return;
    }
    //check body
    for(let i = 3; i < snake.length-3; i += 3){
        if(nextX == snake[i] && nextY == snake[i+1]){
            dead = true;
            break;
        }
    }
}

function checkApple(snake){
    if(nextX == appleX && nextY == appleY){
        makeApple(snake);
        shrink = false;
    }
}
//snake array has three parts
//x cord, y cord, direction
//1 is up, 2 is right, 3 is down, 4 is left
function setUpSnake(){
    if(direction == 1){
        nextX = squareSize*4;
        nextY = squareSize*6+headerSize;
    } else if(direction == 2){
        nextX = squareSize*5;
        nextY = squareSize*7+headerSize;        
    } else if(direction == 3){
        nextX = squareSize*4;
        nextY = squareSize*8+headerSize;
    }
    return [squareSize, squareSize*7+headerSize, 2, squareSize*2, squareSize*7+headerSize, 2, squareSize*3, squareSize*7+headerSize, 2, squareSize*4, squareSize*7+headerSize, 2];
}

var appleX = 0;
var appleY = 0;
function makeApple(snake){
    ready = false;
    while(!ready){
        ready = true;
        appleX = Math.floor(Math.random()*17)*squareSize;
        appleY = Math.floor(Math.random()*15)*squareSize + headerSize;
        for(let i = 0; i < snake.length-3; i += 3){
            if(appleX == snake[i] && appleY == snake[i+1]){
                ready = false;
                break;
            }
        }
    }
}

//gets keypresses
document.onkeydown = checkKey;
function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        //up arrow
            if(snake1[snake1.length-1] != 3)
                direction = 1;
        console.log('up');
    } else if (e.keyCode == '40') {
        //down arrow
            if(snake1[snake1.length-1] != 1)
                direction = 3;
        console.log('down');
    } else if (e.keyCode == '37') {
        //left arrow
            if(snake1[snake1.length-1] != 2)
                direction = 4;
        console.log('left');
    } else if (e.keyCode == '39') {
        //right arrow
            if(snake1[snake1.length-1] != 4)
                direction = 2;
        console.log('right');
    } else if(e.keyCode == '9'){
        //tab key
        removeEvent(window, "resize", viewport);
    } else if(e.keyCode == '13'){
        //enter
        if(!started){
            removeEvent(window, "resize", viewport);
            n = d.getTime();
            startGameLoop();
            started = true;
        }
        console.log('enter');
    }
}