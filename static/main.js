const SCREEN_SQUARE_PERCENTAGE = 0.0001;

class Agent {
    xPosition;
    yPosition;
    size;
    isAlive;
    shouldBeAlive;
    isFirstTime;
    screen;
  
    constructor(xPosition, yPosition, size, screen) {
      this.xPosition = xPosition;
      this.yPosition = yPosition;
      this.size = size;
      this.screen = screen;
      this.isAlive = false;
      this.shouldBeAlive = false;
    }
  
    revive() {
      const color = '#1d8487';
      this.isAlive = true;
      this.draw(color);
    }
  
    delete() {
      const color = 'black';
      this.isAlive = false;
      this.draw(color);
    }
  
    draw(color) {
      this.screen.fillStyle = color;
      this.screen.fillRect(this.xPosition, this.yPosition, this.size - 0.1, this.size);
    }
  
    calculate(xIndex, yIndex, agents) {
      const neighbors = this.getNeighborsNumber(xIndex, yIndex, agents);
      if (this.isAlive) {
        if (neighbors < 2 || neighbors > 3) {
          this.shouldBeAlive = false;
        }
      } else {
        if (neighbors === 3) {
          this.shouldBeAlive = true;
        }
      }
    }
  
    play() {
      if (this.shouldBeAlive && !this.isAlive) {
        this.revive();
      }
      if (!this.shouldBeAlive && this.isAlive) {
        this.delete();
      }
  
    }
  
    getNeighborsNumber(xIndex, yIndex, agents) {
      let neighbors = 0;
      for (let i = xIndex - 1; i <= xIndex + 1; i++) {
        for (let j = yIndex - 1; j <= yIndex + 1; j++) {
          const xNeighborPosition = mod(i, agents.length);
          const yNeighborPosition = mod(j, agents[0].length);
          const isSelf = xIndex === i && yIndex === j;
          if (agents[xNeighborPosition][yNeighborPosition].isAlive && !isSelf) {
            neighbors++;
          }
        }
      }
      return neighbors;
    }
  }
  
function mod(n, m) {
    return ((n % m) + m) % m;
}

class GameOfLife {
    canvas;
    screen;
    agents;
    agentSize;
    isStarted = false;
    gameInterval;
    fps = 100;
  
    constructor(canvas) {
      this.canvas = canvas;
      this.initView();
      this.initPlayers();
      this.listenToResizeChanges();
      this.initGame();
    }
  
    initView() {
      console.log(this.canvas)
      this.screen = this.canvas.getContext('2d');
      this.adjustCanvasDimensions();
      this.screen.beginPath();
      this.screen.stroke();
    }
  
    initPlayers() {
      this.agentSize = Math.sqrt((window.innerHeight * window.innerWidth) * SCREEN_SQUARE_PERCENTAGE);
      const horizontalPlayers = Math.ceil(window.innerWidth / this.agentSize);
      const verticalPlayers = Math.ceil(window.innerHeight / this.agentSize);
      this.agents = [];
      for (let i = 0; i < horizontalPlayers; i++) {
        this.agents[i] = [];
        for (let j = 0; j < verticalPlayers; j++) {
          const xPosition = i * this.agentSize;
          const yPosition = j * this.agentSize;
          this.agents[i][j] = new Agent(xPosition, yPosition, this.agentSize, this.screen);
        }
      }
    }
  
    initGame(initialLiveAgents = 5000) {
      if (!this.isStarted) {
        for (let agentIndex = 0; agentIndex < initialLiveAgents; agentIndex++) {
          this.createAgents();
        }
        this.isStarted = true;
      }
      this.gameInterval = setInterval(() => {
        for (let i = 0; i < this.agents.length; i++) {
          for (let j = 0; j < this.agents[i].length; j++) {
            this.agents[i][j].calculate(i, j, this.agents);
          }
        }
        for (const horizontalAgents of this.agents) {
          for (const agent of horizontalAgents) {
            agent.play();
          }
        }
      }, this.fps);
    }
  
    createAgents() {
      const xIndex = Math.ceil(Math.random() * this.agents.length - 1);
      const yIndex = Math.ceil(Math.random() * this.agents[0].length - 1);
  
      this.agents[xIndex][yIndex].revive();
    }
  
    changeAgentState(xPosition, yPosition) {
      if (this.agentSize) {
        xPosition = Math.floor(xPosition / this.agentSize);
        yPosition = Math.floor(yPosition / this.agentSize);
        const agent = this.agents[xPosition][yPosition];
        if (agent.isAlive) {
          agent.delete();
        } else {
          agent.revive();
        }
      }
    }
  
    addFps(fps) {
      const computedSum = this.fps - fps;
      if (computedSum < 5000 && computedSum > 50) {
        this.fps = computedSum;
        clearInterval(this.gameInterval);
        this.initGame();
      }
    }
  
    listenToResizeChanges() {
      window.addEventListener('resize', () => {
        this.adjustCanvasDimensions();
      });
    }
  
    adjustCanvasDimensions() {
      this.canvas.height = window.innerHeight;
      this.canvas.width = window.innerWidth;
    }
}


var canvas = document.getElementById('game')
var gameOfLife = new GameOfLife(canvas)