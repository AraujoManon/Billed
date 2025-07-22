import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // ✅ CORRECTION: Vérifications DOM pour éviter les crashes
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    if (formNewBill) formNewBill.addEventListener("submit", this.handleSubmit)
    
    const file = this.document.querySelector(`input[data-testid="file"]`)
    if (file) file.addEventListener("change", this.handleChangeFile)
    
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    
    try {
      new Logout({ document, localStorage, onNavigate })
    } catch (error) {
      console.warn('Logout initialization failed:', error)
    }
  }
  
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    
    // ✅ CORRECTION CRITIQUE: Validation des extensions de fichiers
    // PROBLÈME: Aucune validation → fichiers PDF/TXT acceptés → modales vides
    // SOLUTION: Validation stricte JPG/JPEG/PNG uniquement
    const validExtensions = ['jpg', 'jpeg', 'png']
    const fileExtension = fileName.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      // Affichage d'un message d'erreur et reset du champ
      alert('Seuls les fichiers JPG, JPEG et PNG sont acceptés.')
      e.target.value = '' // Reset du champ pour forcer nouvelle sélection
      this.fileUrl = null
      this.fileName = null
      return // Arrêt immédiat du traitement
    }

    // ✅ Traitement normal seulement si le fichier est valide
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