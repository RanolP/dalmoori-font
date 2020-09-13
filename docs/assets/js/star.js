function genStar() {
  this.obj = document.createElement('div')
  this.obj.classList.add('star')
  this.obj.style.top = (Math.random() * 100) + '%'
  this.obj.style.left = (Math.random() * 100) + '%'
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