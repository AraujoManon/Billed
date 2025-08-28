import { ROUTES_PATH } from '../constants/routes.js' // Import des routes de l'application
import { formatDate, formatStatus } from "../app/format.js" // Fonctions utilitaires de formatage
import Logout from "./Logout.js" // Gestion de la déconnexion

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document // Référence au DOM (simulé ou réel)
    this.onNavigate = onNavigate // Fonction de navigation interne
    this.store = store // Couche d'accès aux données (API/DB)
    
    // Récupération du bouton "Nouvelle note de frais"
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    // ✅ Vérification pour éviter un crash si le bouton n'existe pas
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    
    // Récupération de toutes les icônes "œil" (permettant d'afficher les justificatifs)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye && iconEye.length > 0) {
      iconEye.forEach(icon => {
        // ✅ Vérification que l'élément est valide et qu'il possède addEventListener
        if (icon && typeof icon.addEventListener === 'function') {
          // Ajout du listener de clic → ouverture de la modal
          icon.addEventListener('click', () => this.handleClickIconEye(icon))
        }
      })
    }
    
    // Initialisation de la fonctionnalité de déconnexion
    try {
      new Logout({ document, localStorage, onNavigate })
    } catch (error) {
      console.warn('Logout initialization failed:', error) // ✅ Gestion d'erreur
    }
  }

  // Gestion du clic sur "Nouvelle note de frais"
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']) // Redirection vers la page NewBill
  }

  // Gestion du clic sur une icône "œil"
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url") // Récupération du lien vers le justificatif
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5) // Taille de l'image = 50% de la modal
    // Insertion de l'image dans le contenu de la modal
    $('#modaleFile').find(".modal-body").html(
      `<div style='text-align: center;' class="bill-proof-container">
         <img width=${imgWidth} src=${billUrl} alt="Bill" />
       </div>`
    )
    $('#modaleFile').modal('show') // Ouverture de la modal Bootstrap
  }

  // Récupération et traitement des factures
  getBills = () => {
    if (this.store) {
      return this.store
      .bills() // Accès à la collection "bills"
      .list()  // Récupération de la liste
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              // Formatage de la date et du statut
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // ⚠️ Si erreur de formatage (ex: date corrompue), on garde la date brute
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          // ✅ Tri décroissant par date (du plus récent au plus ancien)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          
        console.log('length', bills.length) // Debug : nombre de factures récupérées
        return bills // Renvoi de la liste formatée et triée
      })
    }
  }
}
