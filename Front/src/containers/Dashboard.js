import { formatDate } from '../app/format.js' // Utilitaire pour formater les dates
import DashboardFormUI from '../views/DashboardFormUI.js' // Vue (formulaire à droite du dashboard)
import BigBilledIcon from '../assets/svg/big_billed.js' // Icône affichée quand aucune facture n’est sélectionnée
import { ROUTES_PATH } from '../constants/routes.js' // Chemins de navigation
import USERS_TEST from '../constants/usersTest.js' // Emails de test utilisés pour les tests Jest
import Logout from "./Logout.js" // Gestion de la déconnexion

// 🔎 Filtrer les factures par statut
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // ⚡ Cas Jest (tests) → on prend uniquement les factures avec le bon statut
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // ⚡ Cas production → on exclut les factures de test et celles de l’utilisateur connecté
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

// 🔎 Génère le HTML d’une carte de facture
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0] // On prend la partie avant le @
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : '' // Prénom (si format prénom.nom)
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames // Nom (ou la partie unique)

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

// 🔎 Génère toutes les cartes à partir d’une liste de factures
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

// 🔎 Associe un index numérique à un statut de facture
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // ✅ Correction : gestion de compteurs séparés par liste (1,2,3)
    // Avant : un seul compteur global → ouvrait/fermait toutes les listes en même temps
    this.counters = {} 
    
    // Ajout des listeners sur les 3 flèches du dashboard
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    
    // Gestion de la déconnexion
    new Logout({ localStorage, onNavigate })
  }
  
  // 🔎 Gestion du clic sur l’icône "œil" → ouverture de la modal avec l’image
  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.5)
    $('#modaleFileAdmin1').find(".modal-body").html(
      `<div style='text-align: center;' class="bill-proof-container">
        <img width=${imgWidth} src=${billUrl} alt="Bill" />
       </div>`
    )
    $('#modaleFileAdmin1').modal('show')
  }
  
  // 🔎 Gestion de l’ouverture/fermeture d’une facture spécifique
  handleEditTicket(e, bill, bills) {
    // ✅ Correction : reset du compteur quand on change de facture
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id

    if (this.counter % 2 === 0) {
      // Ouverture du détail d’une facture
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' }) // mise en surbrillance
      $('.dashboard-right-container div').html(DashboardFormUI(bill)) // injecte le formulaire
      $('.vertical-navbar').css({ height: '150vh' }) // agrandit la navbar
      this.counter ++
    } else {
      // Fermeture → retour à l’icône
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })
      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++
    }

    // Listeners sur les boutons du formulaire
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill-d').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill-d').click((e) => this.handleRefuseSubmit(e, bill))
  }
  
  // 🔎 Validation d’une facture
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard']) // Retour dashboard
  }

  // 🔎 Refus d’une facture
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  // 🔎 Gestion ouverture/fermeture des listes (pending, accepted, refused)
  handleShowTickets(e, bills, index) {
    // Initialisation du compteur pour cette liste si besoin
    if (this.counters[index] === undefined) {
      this.counters[index] = 0
    }
    
    if (this.counters[index] % 2 === 0) {
      // Ouverture de la liste
      $(`#arrow-icon${index}`).css({ transform: 'rotate(0deg)'})
      $(`#status-bills-container${index}`)
        .html(cards(filteredBills(bills, getStatus(index))))
      this.counters[index]++ 
    } else {
      // Fermeture de la liste
      $(`#arrow-icon${index}`).css({ transform: 'rotate(90deg)'})
      $(`#status-bills-container${index}`).html("")
      this.counters[index]++
    }

    // Ajout listener pour chaque facture de la liste
    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    return bills
  }

  // 🔎 Récupération de toutes les factures (admin)
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error
      })
    }
  }

  // 🔎 Mise à jour d’une facture
  updateBill = (bill) => {
    if (this.store) {
      return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
