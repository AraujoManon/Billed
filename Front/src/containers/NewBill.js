import { ROUTES_PATH } from '../constants/routes.js' // Constantes des routes de l’app
import Logout from "./Logout.js" // Gestion de la déconnexion

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // ✅ Correction : on vérifie que le formulaire existe avant d’ajouter un listener
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    if (formNewBill) formNewBill.addEventListener("submit", this.handleSubmit)
    
    // Même chose pour l’input fichier
    const file = this.document.querySelector(`input[data-testid="file"]`)
    if (file) file.addEventListener("change", this.handleChangeFile)
    
    // Variables internes pour stocker l’état du fichier
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    
    // Gestion sécurisée de la déconnexion
    try {
      new Logout({ document, localStorage, onNavigate })
    } catch (error) {
      console.warn('Logout initialization failed:', error)
    }
  }
  
  // 🔎 Gestion du changement de fichier (upload du justificatif)
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g) // Découpage du chemin pour récupérer le nom
    const fileName = filePath[filePath.length-1]
    
    // ✅ Correction critique : validation des extensions
    // Avant → acceptait tout (pdf, txt…) → plantage des modales
    const validExtensions = ['jpg', 'jpeg', 'png']
    const fileExtension = fileName.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      // Si extension invalide → alerte + reset du champ
      alert('Seuls les fichiers JPG, JPEG et PNG sont acceptés.')
      e.target.value = '' // On réinitialise le champ
      this.fileUrl = null
      this.fileName = null
      return // On arrête tout ici
    }

    // ⚡ Si fichier valide → on prépare un FormData pour l’envoyer au store
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file) // Le fichier
    formData.append('email', email) // L’email associé

    // Appel au backend (ou mock store) pour sauvegarder le fichier
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true // Important car c’est du FormData
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl) // Debug
        this.billId = key // ID de la facture
        this.fileUrl = fileUrl // URL renvoyée par l’API
        this.fileName = fileName // Nom du fichier stocké
      }).catch(error => console.error(error))
  }
  
  // 🔎 Gestion de la soumission du formulaire NewBill
  handleSubmit = e => {
    e.preventDefault()
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    )

    const email = JSON.parse(localStorage.getItem("user")).email

    // Construction de l’objet facture (bill)
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // par défaut 20%
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl, // rempli lors du handleChangeFile
      fileName: this.fileName,
      status: 'pending' // toujours en attente à la création
    }

    // Envoi au backend
    this.updateBill(bill)

    // Redirection vers la page Bills
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // 🔎 Mise à jour de la facture (pas besoin de test unitaire)
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
