const Bills = ({ document }) => {
  const modal = document.querySelector('#modaleFile')
  const modalBody = document.querySelector('.modal-body')
  const modalImg = modalBody.querySelector('img')

  document.querySelectorAll('[data-testid="icon-eye"]').forEach(icon => {
    icon.addEventListener('click', () => {
      const billUrl = icon.getAttribute('data-bill-url')
      if (billUrl) {
        modalImg.setAttribute('src', billUrl)
        modalImg.style.display = 'block'
        modal.style.display = 'block'
      }
    })
  })

  // Fermer la modale quand on clique sur le bouton ×
  document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none'
    modalImg.style.display = 'none'
  })

  // Fermer la modale quand on clique en dehors de la modale
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none'
      modalImg.style.display = 'none'
    }
  }
}
