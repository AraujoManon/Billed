import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // ✅ CORRECTION CRITIQUE: Vérification de l'existence des éléments DOM
    // PROBLÈME: formNewBill était null et causait un crash sur addEventListener
    // CAUSE: Les tests instancient NewBill sans avoir le bon DOM
    // SOLUTION: Vérification de l'existence avant addEventListener
    
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    if (formNewBill) {
      formNewBill.addEventListener("submit", this.handleSubmit)
    }
    
    const file = this.document.querySelector(`input[data-testid="file"]`)
    if (file) {
      file.addEventListener("change", this.handleChangeFile)
    }
    
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    
    // ✅ CORRECTION: Validation des extensions de fichiers
    const validExtensions = ['jpg', 'jpeg', 'png']
    const fileExtension = fileName.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      // Affichage d'un message d'erreur et reset du champ
      alert('Seuls les fichiers JPG, JPEG et PNG sont acceptés.')
      e.target.value = ''
      this.fileUrl = null
      this.fileName = null
      return // Arrêt du traitement si le fichier n'est pas valide
    }

    // Traitement normal si le fichier est valide
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}