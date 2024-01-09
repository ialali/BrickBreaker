const grid = document.querySelector('.grid')
const scoreDisplay = document.querySelector('#score')
const pauseButton = document.querySelector('#pause')
const restartButton = document.querySelector('#restart')
const blockWidth = 110
const blockHeight = 30
const blockMargin = 5
const userWidth = 200
const userHeight = 20
const ballDiameter = 20
const boardWidth = 1380
const boardHeight = 800
let xDirection = -3
let yDirection = 3

const userStart = [775 - 200, 10]
let currentPosition = userStart

const ballStart = [775 - 20, 40]
let ballCurrentPosition = ballStart

let score = 0
let lastFrameTime = performance.now();
let animationId = null;
let isGameOver = false;
let isGamePaused = false;

//my block
class Block {
    constructor(xAxis, yAxis) {
        this.bottomLeft = [xAxis, yAxis]
        this.bottomRight = [xAxis + blockWidth, yAxis]
        this.topRight = [xAxis + blockWidth, yAxis + blockHeight]
        this.topLeft = [xAxis, yAxis + blockHeight]
    }
}

//all my blocks
const blocks = [];
for (let i = 0; i < 10; i++) { // 10 rows
    for (let j = 0; j < 12; j++) { // 12 blocks per row
        let x = j * (blockWidth + blockMargin);
        let y = boardHeight - ((i + 1) * (blockHeight + blockMargin));
        blocks.push(new Block(x, y));
    }
}

//draw my blocks
function addBlocks() {
    for (let i = 0; i < blocks.length; i++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.style.left = blocks[i].bottomLeft[0] + 'px'
        block.style.bottom = blocks[i].bottomLeft[1] + 'px'
        grid.appendChild(block)
        console.log(blocks[i].bottomLeft)
    }
}
addBlocks()

//add user
const user = document.createElement('div')
user.classList.add('user')
grid.appendChild(user)
drawUser()

//add ball
const ball = document.createElement('div')
ball.classList.add('ball')
grid.appendChild(ball)
drawBall()

//move user
function moveUser(e) {
    const start = performance.now();
    switch (e.key) {
        case 'ArrowLeft':
            if (currentPosition[0] > 30) {
                currentPosition[0] -= 30
                console.log(currentPosition[0] > 0)
                drawUser()
            }
            break
        case 'ArrowRight':
            if (currentPosition[0] < (boardWidth - 20 - userWidth)) {
                currentPosition[0] += 30
                console.log(currentPosition[0])
                drawUser()
            }
            break
    }
    const end = performance.now();
    const duration = end - start;
    console.log(`Execution time: ${duration}ms`);
}
document.addEventListener('keydown', moveUser)

//draw User
function drawUser() {
    user.style.left = currentPosition[0] + 'px'
    user.style.bottom = currentPosition[1] + 'px'
}

//draw Ball
function drawBall() {
    ball.style.left = ballCurrentPosition[0] + 'px'
    ball.style.bottom = ballCurrentPosition[1] + 'px'
}

//move ball
function moveBall() {
    if (isGameOver) {
        return; // If the game is over, don't move the ball
    }
    ballCurrentPosition[0] += xDirection
    ballCurrentPosition[1] += yDirection
    drawBall()
    checkForCollisions()
}
function animate() {
    const currentFrameTime = performance.now();
    const timeDifference = currentFrameTime - lastFrameTime;
    const fps = 1 / (timeDifference / 1000);
    console.log(`FPS: ${fps}`);

    lastFrameTime = currentFrameTime;
    moveBall();
    checkForCollisions();

    // If the game is paused, return early
    if (isGamePaused) {
        return;
    }

    // Only request the next frame if the game is not over
    if (!isGameOver) {
        animationId = requestAnimationFrame(animate);
    }
}
animate();

//check for collisions
function checkForCollisions() {
    //check for block collision
    for (let i = 0; i < blocks.length; i++) {
        if
            (
            (ballCurrentPosition[0] > blocks[i].bottomLeft[0] && ballCurrentPosition[0] < blocks[i].bottomRight[0]) &&
            ((ballCurrentPosition[1] + ballDiameter) > blocks[i].bottomLeft[1] && ballCurrentPosition[1] < blocks[i].topLeft[1])
        ) {
            const allBlocks = Array.from(document.querySelectorAll('.block'))
            allBlocks[i].classList.remove('block')
            blocks.splice(i, 1)
            changeDirection()
            score++
            scoreDisplay.innerHTML = "SCORE:" + " " + score
            if (blocks.length == 0) {
                clearInterval(timerId)
                document.removeEventListener('keydown', moveUser)
            }
        }
    }
    // check for wall hits
    if (ballCurrentPosition[0] >= (boardWidth - ballDiameter) || ballCurrentPosition[0] <= 0 || ballCurrentPosition[1] >= (boardHeight - ballDiameter)) {
        changeDirection()
    }

    //check for user collision
    if
        (
        (ballCurrentPosition[0] > currentPosition[0] && ballCurrentPosition[0] < currentPosition[0] + userWidth) &&
        (ballCurrentPosition[1] > currentPosition[1] && ballCurrentPosition[1] < currentPosition[1] + userHeight)
    ) {
        changeDirection()
    }

    //game over
    if (ballCurrentPosition[1] <= 0) {
        isGameOver = true;

        cancelAnimationFrame(animationId);

        document.removeEventListener('keydown', moveUser)
        return
    }
}


function changeDirection() {
    if (xDirection === 3 && yDirection === 3) {
        yDirection = -3
        return
    }
    if (xDirection === 3 && yDirection === -3) {
        xDirection = -3
        return
    }
    if (xDirection === -3 && yDirection === -3) {
        yDirection = 3
        return
    }
    if (xDirection === -3 && yDirection === 3) {
        xDirection = 3
        return
    }
}


pauseButton.addEventListener('click', function () {
    isGamePaused = !isGamePaused;
    pauseButton.innerHTML = isGamePaused ? 'Resume' : 'Pause'; // Change the button text based on the game state

    if (isGamePaused) {
        cancelAnimationFrame(animationId);

    } else {
        animate(); // If the game is resumed, start the animate function again
    }
});
restartButton.addEventListener('click', function () {
    // Refresh the window
    location.reload();
});