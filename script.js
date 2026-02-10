class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.level = 1;
        this.speed = 100;
        
        // 蛇的初始设置
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        
        // 食物
        this.food = this.generateFood();
        
        // 网格大小
        this.gridSize = 20;
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 更新高分显示
        document.getElementById('high-score').textContent = this.highScore;
        
        // 事件监听
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('speed').addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 绘制初始状态
        this.draw();
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            document.getElementById('start-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.innerHTML = this.gamePaused ? 
            '<i class="fas fa-play"></i> Resume' : 
            '<i class="fas fa-pause"></i> Pause';
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.generateFood();
        
        // 更新显示
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        this.draw();
    }
    
    handleKeyPress(e) {
        // 防止页面滚动
        if ([32, 37, 38, 39, 40, 82].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        switch(e.key) {
            case ' ':
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.resetGame();
                break;
            case 'ArrowUp':
                if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
                break;
        }
    }
    
    generateFood() {
        let food;
        let onSnake;
        
        do {
            onSnake = false;
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            
            // 检查食物是否在蛇身上
            for (let segment of this.snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    onSnake = true;
                    break;
                }
            }
        } while (onSnake);
        
        return food;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 更新方向
        this.direction = {...this.nextDirection};
        
        // 计算新的头部位置
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 添加新的头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            
            // 每100分升一级
            const newLevel = Math.floor(this.score / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                document.getElementById('level').textContent = this.level;
            }
            
            // 更新分数显示
            document.getElementById('score').textContent = this.score;
            
            // 生成新食物
            this.food = this.generateFood();
        } else {
            // 如果没有吃到食物，移除尾部
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.gridWidth || 
            head.y < 0 || head.y >= this.gridHeight) {
            return true;
        }
        
        // 检查自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
            
            // 显示庆祝信息
            alert(`🎉 New High Score: ${this.highScore}! 🎉`);
        } else {
            alert(`Game Over! Your score: ${this.score}`);
        }
    }
    
    draw() {
        // 清除画布
        this.ctx.fillStyle = '#0d1b2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
        
        // 如果暂停，显示暂停文字
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = 'bold 40px Arial';
            this.ctx.fillStyle = '#ffb703';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#90e0ef';
            this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(144, 224, 239, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // 垂直线
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 食物外圈
        this.ctx.fillStyle = '#e63946';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 食物内圈
        this.ctx.fillStyle = '#ffccd5';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSnake() {
        // 绘制蛇身
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 蛇头颜色不同
            if (i === 0) {
                // 头部
                this.ctx.fillStyle = '#00b4d8';
                this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
                
                // 眼睛
                this.ctx.fillStyle = '#1a1a2e';
                const eyeSize = this.gridSize / 5;
                const eyeOffset = this.gridSize / 3;
                
                // 根据方向调整眼睛位置
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                if (this.direction.x === 1) { // 向右
                    leftEyeX = x + this.gridSize - eyeOffset;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + this.gridSize - eyeOffset;
                    rightEyeY = y + this.gridSize - eyeOffset;
                } else if (this.direction.x === -1) { // 向左
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + eyeOffset;
                    rightEyeY = y + this.gridSize - eyeOffset;
                } else if (this.direction.y === 1) { // 向下
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + this.gridSize - eyeOffset;
                    rightEyeX = x + this.gridSize - eyeOffset;
                    rightEyeY = y + this.gridSize - eyeOffset;
                } else { // 向上
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + this.gridSize - eyeOffset;
                    rightEyeY = y + eyeOffset;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // 蛇身
                const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                gradient.addColorStop(0, '#90e0ef');
                gradient.addColorStop(1, '#00b4d8');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
                
                // 蛇身边框
                this.ctx.strokeStyle = '#0077b6';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);
            }
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        if (this.gameRunning && !this.gamePaused) {
            setTimeout(() => this.gameLoop(), this.speed);
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    window.game = game; // 方便在控制台调试
});
