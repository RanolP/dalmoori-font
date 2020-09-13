var isDalmooriEnabled = document.getElementById('is-dalmoori-enabled')

isDalmooriEnabled.onchange = function () {
  if (isDalmooriEnabled.checked) {
    document.getElementsByTagName('body')[0].classList.add('dalmoori')
  } else {
    document.getElementsByTagName('body')[0].classList.remove('dalmoori')
  }
}