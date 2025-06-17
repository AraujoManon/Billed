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

// Mock du store
jest.mock("../app/store", () => mockStore)

// Mock window.alert
global.alert = jest.fn()

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'employee@test.com'
    }))
    
    // Reset mocks
    jest.clearAllMocks()
  })

  describe("When I am on NewBill Page", () => {
    test("Then form should be displayed correctly", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      // Vérifier que le formulaire est présent
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })
  })

  describe("When I upload a file with valid extension", () => {
    test("Then it should accept jpg file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const submitButton = document.querySelector('button[type="submit"]')
      
      // Créer un fichier mock jpg
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Simuler la sélection du fichier
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)

      expect(submitButton.disabled).toBe(false)
      expect(global.alert).not.toHaveBeenCalled()
    })

    test("Then it should accept jpeg file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const submitButton = document.querySelector('button[type="submit"]')
      
      const file = new File(['test'], 'test.jpeg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)

      expect(submitButton.disabled).toBe(false)
      expect(global.alert).not.toHaveBeenCalled()
    })

    test("Then it should accept png file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const submitButton = document.querySelector('button[type="submit"]')
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)

      expect(submitButton.disabled).toBe(false)
      expect(global.alert).not.toHaveBeenCalled()
    })
  })

  describe("When I upload a file with invalid extension", () => {
    test("Then it should show alert and disable submit button", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const submitButton = document.querySelector('button[type="submit"]')
      
      // Créer un fichier mock avec extension invalide
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)

      expect(global.alert).toHaveBeenCalledWith('Seuls les fichiers avec les extensions .jpg, .jpeg ou .png sont autorisés')
      expect(submitButton.disabled).toBe(true)
      expect(fileInput.value).toBe('')
    })

    test("Then it should reject txt file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)

      expect(global.alert).toHaveBeenCalledWith('Seuls les fichiers avec les extensions .jpg, .jpeg ou .png sont autorisés')
    })
  })

  describe("When I upload a valid file and store responds successfully", () => {
    test("Then file should be processed and stored", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)
      
      // Attendre que les promesses se résolvent
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      expect(newBill.fileUrl).toBeTruthy()
      expect(newBill.fileName).toBe('test.jpg')
      expect(newBill.billId).toBeTruthy()
      
      consoleSpy.mockRestore()
    })
  })

  describe("When file upload fails", () => {
    test("Then error should be logged", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock store qui retourne une erreur
      const mockStoreError = {
        bills: () => ({
          create: jest.fn().mockRejectedValue(new Error('Upload failed'))
        })
      }
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStoreError,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      await fireEvent.change(fileInput)
      
      // Attendre que les promesses se résolvent
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe("When I submit the form with valid data", () => {
    test("Then it should create bill and navigate to Bills page", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Simuler un fichier uploadé
      newBill.fileUrl = 'https://test.com/file.jpg'
      newBill.fileName = 'test.jpg'
      newBill.billId = 'test-bill-id'

      // Remplir le formulaire
      const form = screen.getByTestId("form-new-bill")
      const expenseType = screen.getByTestId("expense-type")
      const expenseName = screen.getByTestId("expense-name")
      const datePicker = screen.getByTestId("datepicker")
      const amount = screen.getByTestId("amount")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")
      const commentary = screen.getByTestId("commentary")

      fireEvent.change(expenseType, { target: { value: 'Transports' } })
      fireEvent.change(expenseName, { target: { value: 'Test expense' } })
      fireEvent.change(datePicker, { target: { value: '2023-04-04' } })
      fireEvent.change(amount, { target: { value: '100' } })
      fireEvent.change(vat, { target: { value: '20' } })
      fireEvent.change(pct, { target: { value: '20' } })
      fireEvent.change(commentary, { target: { value: 'Test commentary' } })

      // Soumettre le formulaire
      await fireEvent.submit(form)

      expect(consoleSpy).toHaveBeenCalledWith('e.target.querySelector(`input[data-testid="datepicker"]`).value', '2023-04-04')
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      
      consoleSpy.mockRestore()
    })

    test("Then it should handle form submission with default pct value", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Simuler un fichier uploadé
      newBill.fileUrl = 'https://test.com/file.jpg'
      newBill.fileName = 'test.jpg'
      newBill.billId = 'test-bill-id'

      const form = screen.getByTestId("form-new-bill")
      const expenseType = screen.getByTestId("expense-type")
      const expenseName = screen.getByTestId("expense-name")
      const datePicker = screen.getByTestId("datepicker")
      const amount = screen.getByTestId("amount")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")

      fireEvent.change(expenseType, { target: { value: 'Transports' } })
      fireEvent.change(expenseName, { target: { value: 'Test expense' } })
      fireEvent.change(datePicker, { target: { value: '2023-04-04' } })
      fireEvent.change(amount, { target: { value: '100' } })
      fireEvent.change(vat, { target: { value: '20' } })
      fireEvent.change(pct, { target: { value: '' } }) // Valeur vide pour tester la valeur par défaut

      await fireEvent.submit(form)

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      
      consoleSpy.mockRestore()
    })
  })

  describe("When updateBill is called with store", () => {
    test("Then it should update bill and navigate", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      newBill.billId = 'test-bill-id'

      const bill = {
        email: 'employee@test.com',
        type: 'Transports',
        name: 'Test expense',
        amount: 100,
        date: '2023-04-04',
        vat: '20',
        pct: 20,
        commentary: 'Test commentary',
        fileUrl: 'https://test.com/file.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }

      await newBill.updateBill(bill)
      
      // Attendre que les promesses se résolvent
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      })
    })

    test("Then it should handle updateBill error", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock store qui retourne une erreur
      const mockStoreError = {
        bills: () => ({
          update: jest.fn().mockRejectedValue(new Error('Update failed'))
        })
      }
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStoreError,
        localStorage: window.localStorage
      })

      newBill.billId = 'test-bill-id'

      const bill = {
        email: 'employee@test.com',
        type: 'Transports',
        name: 'Test expense',
        amount: 100,
        date: '2023-04-04',
        vat: '20',
        pct: 20,
        commentary: 'Test commentary',
        fileUrl: 'https://test.com/file.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }

      await newBill.updateBill(bill)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })
      
      consoleErrorSpy.mockRestore()
    })

    test("Then it should handle updateBill when no store", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const bill = {
        email: 'employee@test.com',
        type: 'Transports'
      }

      const result = newBill.updateBill(bill)
      
      // Quand il n'y a pas de store, la méthode ne fait rien
      expect(result).toBeUndefined()
    })
  })

  describe("When NewBill is instantiated", () => {
    test("Then it should initialize correctly", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      expect(newBill.document).toBe(document)
      expect(newBill.onNavigate).toBe(onNavigate)
      expect(newBill.store).toBe(mockStore)
      expect(newBill.fileUrl).toBeNull()
      expect(newBill.fileName).toBeNull()
      expect(newBill.billId).toBeNull()
    })
  })

  describe("When handleChangeFile is called directly", () => {
    test("Then it should prevent default behavior", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      const mockEvent = {
        preventDefault: jest.fn(),
        target: fileInput
      }

      await newBill.handleChangeFile(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe("When handleSubmit is called directly", () => {
    test("Then it should prevent default behavior and log date", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Simuler un fichier uploadé
      newBill.fileUrl = 'https://test.com/file.jpg'
      newBill.fileName = 'test.jpg'
      newBill.billId = 'test-bill-id'

      const form = screen.getByTestId("form-new-bill")
      const datePicker = screen.getByTestId("datepicker")
      
      fireEvent.change(datePicker, { target: { value: '2023-04-04' } })

      const mockEvent = {
        preventDefault: jest.fn(),
        target: form
      }

      newBill.handleSubmit(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('e.target.querySelector(`input[data-testid="datepicker"]`).value', '2023-04-04')
      
      consoleSpy.mockRestore()
    })
  })
})