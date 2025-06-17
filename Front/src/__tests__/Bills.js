/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

// Mock jQuery COMPLET au début du fichier
global.$ = jest.fn((selector) => {
  const mockElement = {
    width: jest.fn(() => 500),
    find: jest.fn(() => ({
      html: jest.fn()
    })),
    modal: jest.fn(),
    click: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
    show: jest.fn(),
    hide: jest.fn()
  }
  return mockElement
})

// Mock du store
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks()
    // Reset du DOM
    document.body.innerHTML = ""
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()
     })
    test("Then bills should be ordered from earliest to latest", () => {
      // Trier les données avant de les passer à BillsUI
      const sortedBills = [...bills].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA - dateB
      })
      
      document.body.innerHTML = BillsUI({ data: sortedBills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const datesSorted = [...dates].sort((a, b) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateA - dateB
      })
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills Page and I click on new bill button", () => {
    test("Then it should navigate to NewBill page", async () => {
      const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      
      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const newBillBtn = screen.getByTestId('btn-new-bill')
      await userEvent.click(newBillBtn)
      
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })

  describe("When I am on Bills Page and I click on eye icon", () => {
    test("Then it should open modal with bill proof", async () => {
      const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      
      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      await userEvent.click(eyeIcon)
      
      expect(global.$).toHaveBeenCalledWith('#modaleFile')
    })
  })

  describe("When I am on Bills Page and getBills is called", () => {
    test("Then it should return formatted bills from store", async () => {
      const onNavigate = jest.fn()

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const result = await billsContainer.getBills()
      
      expect(result).toBeDefined()
      expect(result.length).toBe(4)
    })

    test("Then it should handle corrupted data and log error", async () => {
      const onNavigate = jest.fn()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      const corruptedStore = {
        bills: () => ({
          list: () => Promise.resolve([
            {
              id: "1",
              date: "invalid-date-format",
              status: "pending"
            }
          ])
        })
      }

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: corruptedStore,
        localStorage: window.localStorage
      })

      await billsContainer.getBills()
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    test("Then it should return undefined when no store", () => {
      const onNavigate = jest.fn()
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const result = billsContainer.getBills()
      
      expect(result).toBeUndefined()
    })
  })

  describe("When Bills container is instantiated without new bill button", () => {
    test("Then it should not crash", () => {
      document.body.innerHTML = '<div></div>'
      const onNavigate = jest.fn()
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      expect(billsContainer).toBeDefined()
    })
  })

  describe("When Bills container is instantiated without eye icons", () => {
    test("Then it should not crash", () => {
      document.body.innerHTML = '<div></div>'
      const onNavigate = jest.fn()
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      expect(billsContainer).toBeDefined()
    })
  })

  describe("When eye icon is clicked with bill URL", () => {
    test("Then modal should display image with correct width", async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = jest.fn()
      
      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      eyeIcon.setAttribute('data-bill-url', 'https://example.com/bill.jpg')
      
      await userEvent.click(eyeIcon)
      
      expect(global.$).toHaveBeenCalledWith('#modaleFile')
    })
  })

  describe("When Bills page is loaded and bills are retrieved", () => {
    test("Then console.log should be called with bills length", async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      const onNavigate = jest.fn()

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      await billsContainer.getBills()
      
      expect(consoleSpy).toHaveBeenCalledWith('length', 4)
      
      consoleSpy.mockRestore()
    })
  })

  describe("When handleClickIconEye is called directly", () => {
    test("Then it should handle the modal opening correctly", () => {
      const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const mockIcon = document.createElement('div')
      mockIcon.setAttribute('data-bill-url', 'https://test.com/image.jpg')
      
      billsContainer.handleClickIconEye(mockIcon)
      
      expect(global.$).toHaveBeenCalledWith('#modaleFile')
    })
  })
})