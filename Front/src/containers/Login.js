import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = '' // Variable globale qui garde en mémoire la dernière page visitée

// On utilise une classe pour pouvoir tester ses méthodes en e2e
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document // Accès au DOM
    this.localStorage = localStorage // Stockage local du navigateur
    this.onNavigate = onNavigate // Fonction de navigation
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION // Copie de la valeur précédente (sera mise à jour)
    this.store = store // API ou mock de store

    // Récupération du formulaire "Employé"
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)

    // Récupération du formulaire "Admin"
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }
  
  // 🔎 Soumission du formulaire Employé
  handleSubmitEmployee = e => {
    e.preventDefault() // On empêche le rechargement de la page

    // Création de l'objet user
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }

    // Sauvegarde dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user))

    // ✅ Correction : on retourne la promesse pour que `await` fonctionne dans les tests
    return this.login(user)
      .catch(
        // Si l’utilisateur n’existe pas, on le crée
        (err) => this.createUser(user)
      )
      .then(() => {
        // Navigation vers la page "Bills"
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION // Mise à jour de la variable globale
        this.document.body.style.backgroundColor="#fff" // Reset du background
      })
  }

  // 🔎 Soumission du formulaire Admin
  handleSubmitAdmin = e => {
    e.preventDefault()

    // Création de l'objet user
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected"
    }

    // Sauvegarde dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user))

    // ✅ Même correction que pour Employee : on retourne la promesse
    return this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        // Navigation vers le Dashboard admin
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        this.document.body.style.backgroundColor="#fff"
      })
  }

  // 🔎 Connexion de l’utilisateur (pas couvert par les tests)
  login = (user) => {
    if (this.store) {
      return this.store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({jwt}) => {
        // Sauvegarde du token JWT en localStorage
        localStorage.setItem('jwt', jwt)
      })
    } else {
      return null // Cas sans store (tests unitaires)
    }
  }

  // 🔎 Création d’un nouvel utilisateur (pas couvert par les tests)
  createUser = (user) => {
    if (this.store) {
      return this.store
      .users()
      .create({data:JSON.stringify({
        type: user.type,
        name: user.email.split('@')[0], // Le nom est basé sur la partie avant le @
        email: user.email,
        password: user.password,
      })})
      .then(() => {
        console.log(`User with ${user.email} is created`)
        // Après création → tentative de login
        return this.login(user)
      })
    } else {
      return null
    }
  }
}
