function genStar() {
  this.obj = document.createElement('div')
  this.obj.classList.add('star')
  this.obj.style.top = (window.innerHeight * Math.random()) + 'px'
  this.obj.style.left = (window.innerWidth * Math.random()) + 'px'
  this.obj.style.height = '3px'
  this.obj.style.width = '3px'
  document.getElementsByClassName('stars')[0].appendChild(this.obj)
}

function genStars() {
  for (i = 0; i < 200; i++) {
    new genStar()
  }
}

genStars()