
window.requestAnimFrame = (function(callback) {
    return function(callback) {
      window.setTimeout(callback, 1000 / 16);
    };
  })()

window.onload = async () => {
    
        const windowCanvasElement = document.getElementById('window')
    
        windowCanvasElement.width = window.innerWidth
        windowCanvasElement.height = window.innerHeight
    
        const windowCanvas = windowCanvasElement.getContext('2d')
        let player = await getPlayer()
        startPlayerListeners(player)

        rerender(player, windowCanvas, windowCanvasElement)
    }

    function rerender(player, windowCanvas, windowCanvasElement){
        player = changePlayerSpeed(pressedKeys, player)
        if (player.speed.x | player.speed.y) {
            player = movePlayer(player)
        }
        renderUniverse(windowCanvas, windowCanvasElement, player)

        requestAnimFrame(() => rerender(player, windowCanvas, windowCanvasElement))
    }
    
    let pressedKeys = {}
    function startPlayerListeners(player) {
        window.addEventListener('keydown', (e) => {
            pressedKeys[e.keyCode] = true
        })
        window.addEventListener('keyup', (e) => {
            pressedKeys[e.keyCode] = false
        })
    }   

    function changePlayerSpeed(pressedKeys, player){
        let baseSpeed = 20

        player.speed.y = 0
        player.speed.x = 0

        if(pressedKeys['87']) {
            player.speed.y = -baseSpeed
            player.direction = directions.top
        } 
        if(pressedKeys['83']) {
            player.speed.y = +baseSpeed
            player.direction = directions.bottom
        }
        if(pressedKeys['65']) {
            player.speed.x = -baseSpeed
            player.direction = directions.left
        } 
        if(pressedKeys['68']) {
            player.speed.x = +baseSpeed
            player.direction = directions.right
        }
        if (!pressedKeys['87'] && 
            !pressedKeys['83'] && 
            !pressedKeys['65'] && 
            !pressedKeys['68']) {
            player.idle()
        }

        return player
    }
    
    function movePlayer(player) {
        if (player.speed.x && player.speed.y) {
            player.speed.x /= 2
            player.speed.y /= 2
        }
        player.position.x += player.speed.x
        player.position.y += player.speed.y
        player.speed.y = 0
        player.speed.x = 0
        player.nextAnimationFrame()

        return player
    }

    const directions = {
        top: { rotation: 270 },
        bottom: { rotation: 90  },
        left: { rotation: 180, scale: -1  },
        right: { rotation: 0, scale: 1 }
    }

    function renderPlayer(canvas, { size, position, image, direction, getAnimationFrame }) {
        canvas.save()
        canvas.translate(position.x, position.y) 
        canvas.translate(size.width/2, size.height/2) 
        canvas.rotate(direction.rotation*Math.PI/180)
        if (direction.scale) canvas.scale(1, direction.scale)
        canvas.drawImage(image, 
            size.width*getAnimationFrame(), 0, 
            size.width, size.height, 
            -size.width/2, -size.height/2, 
            size.width, size.height)
        canvas.restore()
    }

    function renderUniverse(canvas, canvasElement, player) {
        canvas.clearRect(0, 0, canvasElement.width, canvasElement.height)
        renderPlayer(canvas, player)
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
          let image = new Image()
          image.src = src
          image.onload = () => resolve(image)
          image.onerror = reject
        })
      }

    async function getPlayer() {
        let spriteSheet = {
            image: await loadImage('./tiny_hero.png'),
            frame: 0,
            columns: 4
        }
        let size = { height: 128, width: 129 }
        return {
            position: { x: window.innerWidth/2-(size.width/2), y: window.innerHeight/2-(size.height/2) },
            direction: directions.right,
            size: size,
            speed: { x: 0, y: 0 },
            image: spriteSheet.image,
            idle(){
                spriteSheet.frame = 0
            },
            nextAnimationFrame() {
                spriteSheet.frame = (spriteSheet.frame <= spriteSheet.columns) ? spriteSheet.frame + 1 : 0
            },
            getAnimationFrame() {
                return spriteSheet.frame
            }
        }
    }