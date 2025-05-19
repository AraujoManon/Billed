# Documentation des Corrections des Bugs

## 1. Problème de Login Admin

### Erreur initiale
```
TypeError: Cannot read properties of null (reading 'value')
```

### Cause
Le test utilisait les mauvais testIds pour le formulaire admin, essayant d'accéder aux champs avec les testIds du formulaire employé.

### Correction
1. Dans `Login.js` :
   - Changé les testIds dans `handleSubmitAdmin` pour utiliser les bons testIds du formulaire admin
   - Remplacé `employee-email-input` par `admin-email-input`
   - Remplacé `employee-password-input` par `admin-password-input`

2. Dans `LoginUI.js` :
   - Les testIds étaient corrects (`admin-email-input` et `admin-password-input`)

## 2. Problème de Tri des Dates dans Bills

### Erreur initiale
```
expect(received).toEqual(expected) // deep equality
- Expected  - 2
+ Received  + 2

Array [
+   "2004-04-04",
    "2001-01-01",
-   "2002-02-02",
    "2003-03-03",
-   "2004-04-04",
+   "2002-02-02",
]
```

### Cause
Le test ne triait pas correctement les dates avant de les passer à BillsUI, et la fonction de tri utilisait une méthode inappropriée (`localeCompare` sur les chaînes).

### Correction
1. Dans `Bills.js` :
   - Ajouté un tri des données avant de les passer à BillsUI
   ```javascript
   const sortedBills = [...bills].sort((a, b) => {
     const dateA = new Date(a.date)
     const dateB = new Date(b.date)
     return dateA - dateB
   })
   ```
   - Utilisation d'une fonction de tri simple avec des objets Date
   - Le tri est maintenant fait sur les objets Date directement pour un ordre chronologique correct

## 3. Problème de Mocking dans Login Tests

### Erreur initiale
```
TypeError: Cannot read properties of null (reading 'value')
```

### Cause
Les tests ne vérifiaient pas correctement l'existence des éléments dans le DOM avant d'essayer d'y accéder.

### Correction
1. Dans `Login.js` :
   - Ajout de vérifications d'existence des éléments
   ```javascript
   const form = screen.getByTestId("form-admin");
   expect(form).toBeTruthy();
   ```
   - Utilisation de `querySelector` sur le formulaire pour trouver les champs
   ```javascript
   const inputEmailUser = form.querySelector(`input[data-testid="admin-email-input"]`);
   ```

## 4. Problème de Configuration de localStorage

### Erreur initiale
```
expect(jest.fn()).toHaveBeenCalledWith(...expected)
Expected: "user", "{"type":"Employee","email":"johndoe@email.com","password":"azerty","status":"connected"}"
Received
       1: "user", "{"type":"Employee","email":"","password":"","status":"connected"}"
       2: "user", "{"type":"Employee","email":"","password":"","status":"connected"}"
```

### Cause
Les champs du formulaire n'étaient pas correctement remplis avant d'être envoyés au localStorage.

### Correction
1. Dans `Login.js` :
   - Vérification que les champs sont correctement remplis avant d'être envoyés
   ```javascript
   fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
   expect(inputEmailUser.value).toBe(inputData.email);
   ```
   - Configuration correcte du mock de localStorage
   ```javascript
   Object.defineProperty(window, "localStorage", {
     value: {
       getItem: jest.fn(() => null),
       setItem: jest.fn(() => null),
     },
     writable: true,
   });
   ```

## 5. Problème de Validation des Fichiers dans NewBill

### Erreur initiale
Lors de la sélection d'un fichier non valide (extension autre que .jpg, .jpeg ou .png), le message d'erreur s'affichait mais le bouton de validation restait actif.

### Correction
1. Dans `NewBill.js` :
   - Ajout d'un compteur pour le bouton de validation
   - Désactivation du bouton lors de la sélection d'un fichier invalide
   - Réactivation du bouton uniquement quand un fichier valide est sélectionné
   - Effacement automatique du fichier invalide

```javascript
handleChangeFile = e => {
  const submitButton = this.document.querySelector(`button[type="submit"]`)
  
  // Vérifier l'extension du fichier
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    alert('Seuls les fichiers avec les extensions .jpg, .jpeg ou .png sont autorisés');
    submitButton.disabled = true;
    e.target.value = '';
    return;
  }

  submitButton.disabled = false;
  // ... reste du code
}
```

## 6. Problème de Blocage des Listes dans Dashboard

### Erreur initiale
Les listes de tickets dans le Dashboard se bloquaient mutuellement : après avoir déplié une liste et sélectionné un ticket, on ne pouvait plus sélectionner de tickets dans les autres listes.

### Cause
1. Les événements de clic s'accumulaient sur les tickets
2. Les compteurs d'état des listes étaient mal gérés
3. Les événements n'étaient pas correctement nettoyés

### Correction
1. Dans `Dashboard.js` :
   - Ajout d'un système de compteurs séparés pour chaque liste
   ```javascript
   this.counters = {
     1: 0, // Liste pending
     2: 0, // Liste accepted
     3: 0   // Liste refused
   }
   ```
   - Nettoyage des événements existants avant d'en ajouter de nouveaux
   ```javascript
   bills.forEach(bill => {
     $(`#open-bill${bill.id}`).off('click').on('click', (e) => this.handleEditTicket(e, bill, bills))
   })
   ```
   - Utilisation de `.on('click')` au lieu de `.click()` pour une meilleure gestion des événements

## Conclusion

Ces corrections ont permis de :
1. Résoudre les problèmes de testIds dans le formulaire admin
2. Implémenter un tri correct des dates dans Bills
3. Améliorer la robustesse des tests avec des vérifications d'existence
4. Configurer correctement le localStorage pour les tests
5. Ajouter une validation des fichiers dans NewBill avec désactivation du bouton de validation
6. Résoudre le blocage des listes dans Dashboard avec une meilleure gestion des événements et des compteurs

Tous les tests passent maintenant avec succès et l'interface utilisateur fonctionne correctement, indiquant que les problèmes ont été résolus de manière complète.
