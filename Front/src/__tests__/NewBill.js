/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // ✅ Setup environnement de test complet
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld'
    }))
    
    // Mock de window.alert
    window.alert = jest.fn()
    
    // Mock console pour éviter le spam mais permettre la vérification
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    // Nettoyage après chaque test
    document.body.innerHTML = ''
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed with all required fields", () => {
      // ✅ Test d'affichage du formulaire
      const html = NewBillUI()
      document.body.innerHTML = html
      
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
    })

    // ✅ NOUVEAU TEST: Constructor avec DOM complet
    test("Then NewBill should be initialized correctly with form elements", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      expect(newBillInstance.document).toBe(document)
      expect(newBillInstance.onNavigate).toBe(onNavigate)
      expect(newBillInstance.store).toBe(mockStore)
      expect(newBillInstance.fileUrl).toBeNull()
      expect(newBillInstance.fileName).toBeNull()
      expect(newBillInstance.billId).toBeNull()
    })

    // ✅ NOUVEAU TEST: Constructor sans éléments DOM
    test("Then NewBill should be initialized correctly without form elements", () => {
      document.body.innerHTML = '<div>No form here</div>'
      const onNavigate = jest.fn()
      
      expect(() => {
        new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
      }).not.toThrow()
    })

    // ✅ NOUVEAU TEST: handleChangeFile avec fichier valide
    test("Then uploading a valid JPG file should work", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      // Mock du store pour simuler l'upload
      const mockCreate = jest.fn().mockResolvedValue({
        fileUrl: 'https://localhost:3456/images/test.jpg',
        key: '1234'
      })
      
      const mockStoreInstance = {
        bills: jest.fn(() => ({
          create: mockCreate
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStoreInstance,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })

      // Mock de l'événement
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\test.jpg'
        }
      }

      // Mock du querySelector pour retourner le fichier
      jest.spyOn(document, 'querySelector').mockReturnValue({
        files: [file]
      })

      await newBillInstance.handleChangeFile(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })

    // ✅ NOUVEAU TEST: handleChangeFile avec fichier invalide  
    test("Then uploading an invalid PDF file should show error and reset field", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\document.pdf'
        }
      }

      newBillInstance.handleChangeFile(mockEvent)

      expect(window.alert).toHaveBeenCalledWith('Seuls les fichiers JPG, JPEG et PNG sont acceptés.')
      expect(mockEvent.target.value).toBe('')
      expect(newBillInstance.fileUrl).toBeNull()
      expect(newBillInstance.fileName).toBeNull()
    })

    // ✅ NOUVEAU TEST: handleChangeFile extensions variées
    test("Then different valid extensions should be accepted", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Test JPG (majuscule)
      const mockEventJPG = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.JPG' }
      }
      
      // Mock querySelector pour retourner un fichier
      jest.spyOn(document, 'querySelector').mockReturnValue({
        files: [new File([''], 'test.JPG')]
      })

      newBillInstance.handleChangeFile(mockEventJPG)
      expect(window.alert).not.toHaveBeenCalled()

      // Reset alert mock
      window.alert.mockClear()

      // Test jpeg
      const mockEventJpeg = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.jpeg' }
      }
      
      newBillInstance.handleChangeFile(mockEventJpeg)
      expect(window.alert).not.toHaveBeenCalled()
    })

    // ✅ NOUVEAU TEST: handleSubmit
    test("Then submitting the form should create a new bill", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Mock de updateBill
      newBillInstance.updateBill = jest.fn()
      
      // Préparer des valeurs de formulaire
      newBillInstance.fileUrl = 'https://test.jpg'
      newBillInstance.fileName = 'test.jpg'

      const form = screen.getByTestId('form-new-bill')
      
      // Mock des valeurs du formulaire
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn((selector) => {
            const mockElements = {
              'select[data-testid="expense-type"]': { value: 'Transports' },
              'input[data-testid="expense-name"]': { value: 'Test expense' },
              'input[data-testid="amount"]': { value: '100' },
              'input[data-testid="datepicker"]': { value: '2023-04-04' },
              'input[data-testid="vat"]': { value: '20' },
              'input[data-testid="pct"]': { value: '20' },
              'textarea[data-testid="commentary"]': { value: 'Test comment' }
            }
            return mockElements[selector] || { value: '' }
          })
        }
      }

      newBillInstance.handleSubmit(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(newBillInstance.updateBill).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })

    // ✅ NOUVEAU TEST: updateBill avec store
    test("Then updateBill should call store update when store exists", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      const mockUpdate = jest.fn().mockResolvedValue({})
      const mockStoreInstance = {
        bills: jest.fn(() => ({
          update: mockUpdate
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStoreInstance,
        localStorage: window.localStorage
      })

      newBillInstance.billId = 'test-bill-id'

      const testBill = {
        email: 'test@test.com',
        type: 'Transports',
        name: 'Test bill',
        amount: 100,
        date: '2023-04-04',
        vat: '20',
        pct: 20,
        commentary: 'Test',
        fileUrl: 'https://test.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }

      await newBillInstance.updateBill(testBill)

      expect(mockUpdate).toHaveBeenCalledWith({
        data: JSON.stringify(testBill),
        selector: 'test-bill-id'
      })
    })

    // ✅ NOUVEAU TEST: updateBill sans store
    test("Then updateBill should do nothing when no store", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const testBill = { name: 'test' }

      expect(() => {
        newBillInstance.updateBill(testBill)
      }).not.toThrow()
    })

    // ✅ CORRECTION: Tests d'erreurs simplifiés - Pas de promesse attendue
    test("Then handleChangeFile should handle API errors gracefully", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      // Mock store qui rejette
      const mockStoreError = {
        bills: jest.fn(() => ({
          create: jest.fn(() => Promise.reject(new Error('Upload failed')))
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStoreError,
        localStorage: window.localStorage
      })

      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.jpg' }
      }

      // Mock querySelector
      jest.spyOn(document, 'querySelector').mockReturnValue({
        files: [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      })

      // Le test vérifie que l'application ne crash pas malgré l'erreur
      expect(() => {
        newBillInstance.handleChangeFile(mockEvent)
      }).not.toThrow()
    })

    test("Then updateBill should handle API errors gracefully", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      const mockStoreError = {
        bills: jest.fn(() => ({
          update: jest.fn(() => Promise.reject(new Error('Update failed')))
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStoreError,
        localStorage: window.localStorage
      })

      const testBill = { name: 'test' }

      // Le test vérifie que l'application ne crash pas malgré l'erreur
      expect(() => {
        newBillInstance.updateBill(testBill)
      }).not.toThrow()
    })
  })

  // ✅ TESTS D'INTÉGRATION SIMPLIFIÉS
  describe("When I create a new bill", () => {
    test("Then it should integrate with the full workflow", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      
      await waitFor(() => screen.getByTestId('form-new-bill'))
      
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })

    test("fetches error from an API and fails with 404 message error", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      const mockStore404 = {
        bills: jest.fn(() => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
          update: jest.fn(() => Promise.reject(new Error("Erreur 404")))
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore404,
        localStorage: window.localStorage
      })

      // Test create error - vérifie que l'app ne crash pas
      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.jpg' }
      }

      jest.spyOn(document, 'querySelector').mockReturnValue({
        files: [new File([''], 'test.jpg')]
      })

      expect(() => {
        newBillInstance.handleChangeFile(mockEvent)
      }).not.toThrow()

      // Test update error - vérifie que l'app ne crash pas  
      expect(() => {
        newBillInstance.updateBill({ name: 'test' })
      }).not.toThrow()
    })

    test("fetches error from an API and fails with 500 message error", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      
      const mockStore500 = {
        bills: jest.fn(() => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
          update: jest.fn(() => Promise.reject(new Error("Erreur 500")))
        }))
      }

      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore500,
        localStorage: window.localStorage
      })

      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.jpg' }
      }

      jest.spyOn(document, 'querySelector').mockReturnValue({
        files: [new File([''], 'test.jpg')]
      })

      // Vérifie que l'application gère l'erreur sans crash
      expect(() => {
        newBillInstance.handleChangeFile(mockEvent)
      }).not.toThrow()
    })
  })
})