import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // ✅ CORRECTION: Vérifications DOM pour éviter les crashes
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye && iconEye.length > 0) {
      iconEye.forEach(icon => {
        if (icon && typeof icon.addEventListener === 'function') {
          icon.addEventListener('click', () => this.handleClickIconEye(icon))
        }
      })
    }
    
    try {
      new Logout({ document, localStorage, onNavigate })
    } catch (error) {
      console.warn('Logout initialization failed:', error)
    }
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          // ✅ CORRECTION CRITIQUE: Ajout du tri chronologique décroissant
          // Tri par date : du plus récent (2024-12-01) au plus ancien (2020-01-01)
          // AVANT (MANQUANT): return bills (pas de tri)
          // APRÈS (CORRIGÉ): .sort((a, b) => (a.date < b.date ? 1 : -1))
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          
        console.log('length', bills.length)
        return bills
      })
    }
  }
}