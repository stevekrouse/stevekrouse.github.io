class Rummikub extends Croquet.Model {
    init() {
      this.newGame(); 
      this.subscribe("default", "updateTile", this.updateTile)
      this.subscribe("default", "newGame", this.newGame)
    }
  
  newGame() {
    this.tiles = ['red', 'blue', 'green', 'orange'].map(color => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(number => ({
          color,
          number,
          tileState: 'UNPICKED',
          x: Math.random() * .2,
          y: Math.random() * .2,
          moving: "NOT MOVING"
      }))).reduce((a, b) => a.concat(b), [{
          color: 'green',
          number: ':)',
          tileState: 'UNPICKED',
          x: Math.random() * .2,
          y: Math.random() * .2,
          moving: "NOT MOVING"
      }, {
          color: 'red',
          number: ':)',
          tileState: 'UNPICKED',
          x: Math.random() * .2,
          y: Math.random() * .2,
          moving: "NOT MOVING"
      }])      
  }
  unpickedTiles() {
    return this.tiles.filter(tile => tile.tileState === 'UNPICKED')
  }
  
  newUser(user) {
    this.users.push(user)
  }
  
  updateTile({number, color, tileState, x, y, moving}) {
    let tile = this.tiles.find(tile => tile.number === number && tile.color === color)
    if (tileState) tile.tileState = tileState
    if (x) tile.x = x
    if (y) tile.y = y
    if (moving) tile.moving = moving
    
    if(this.unpickedTiles().length === 0) {
      setTimeout(this.newGame, 1000); 
    }
  }
}
Rummikub.register();

function inHand(y) {
  return y > hand.getBoundingClientRect().top
}

class MyView extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;
      
      let savedName = localStorage.getItem('name');
      if (savedName !== null && savedName !== "null") {
        this.name = savedName 
      } else {
        this.getName()
      }
      
      if (new URLSearchParams(window.location.search).get('newgame')) {
        this.publish("default", "newGame")
        setTimeout(() => window.location.search = "", 1000)
      }
      scoreboard.addEventListener("touchstart", this.getName.bind(this))
    }
  
    getName() {
      let oldName = this.name
      this.name = prompt("What's your name?")
      localStorage.setItem('name', this.name)
      
      this.model.tiles.forEach(({color, number, tileState}) => {
        if (tileState === oldName) {
          this.publish("default", "updateTile", {
            color, number, 
            tileState: this.name
          })
        }
      })
    }
  
    getTile({color, number}) {
      return this.model.tiles.find(tile => tile.number === number && tile.color === color)
    }
  
    update() {
          let score = {}
          this.model.tiles.forEach(({tileState}) => {
            if (!(tileState === "UNPICKED" || tileState === "PLAYED")) {
              score[tileState] = (score[tileState] || 0) + 1
            }
          })
          scoreboard.innerHTML = JSON.stringify(score).replace("{", "").replace("}", "").replace(/"/g, "").replace(/,/g, '<br>').replace(this.name, `<b>${this.name}</b>`).replace(/:/g, ": ")
      
          this.model.tiles.forEach(({color, number, x, y, tileState}) => {
            let id = color + number 
            if (!(tileState === "UNPICKED" || tileState === "PLAYED" || tileState === this.name)) {
              let elem = document.getElementById(id)
              if (elem) elem.remove()
              return
            }
            let elem = document.getElementById(id)
            if (!elem) {
              elem = document.createElement('div')
              elem.style["z-index"] = Math.floor(Math.random() * 10)
              elem.innerHTML = `<div style="color:${color}; font-size: 1.5em">${number}</div>`
              elem.id = id
              elem.classList.add('tile')
              elem.ontouchend = e => setTimeout(() => {
                elem.moving = false
                elem.style["z-index"] = 1
                this.publish("default", "updateTile", {
                  color, number, 
                  moving: "NOT MOVING"
                })
              }, 1000)
              elem.ontouchmove = e => { 
                let {tileState, moving} = this.getTile({color, number})
                
                if (!(moving === "NOT MOVING" || moving === this.name)) {
                  return
                }
                
                elem.moving = true
                
                let b = elem.getBoundingClientRect()
                let clientX =  e.touches[0].clientX - (b.width /2)
                let clientY = e.touches[0].clientY - (b.height/2)
                
                elem.style.left = clientX + "px"
                elem.style.top = clientY + "px"
                elem.style["z-index"] = 999
                
                let newTileState
                if (inHand(e.touches[0].clientY + (b.height/2))) {
                  newTileState = this.name
                } else if (tileState === this.name) {
                  newTileState = "PLAYED"
                }
                
                this.publish("default", "updateTile", {
                  color, number, 
                  x: clientX / window.innerWidth, 
                  y:  clientY / window.innerHeight,
                  tileState: newTileState,
                  moving: this.name
                })
              }
              container.append(elem)
            } else if (!elem.moving) {
              elem.style.left = x * window.innerWidth + "px"
              elem.style.top = y * window.innerHeight + "px"
            }
            elem.firstChild.style.display = tileState === "UNPICKED" ? 'none' : 'block'
        })
    }

}

Croquet.Session.join("Rummikub", Rummikub, MyView).then(r => window.r = r);
