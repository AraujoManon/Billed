/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { ROUTES_PATH } from "../constants/routes.js";
import { fireEvent, screen } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      // Vérifier que le formulaire admin existe
      const form = screen.getByTestId("form-admin");
      expect(form).toBeTruthy();

      // Attendre que les éléments soient présents dans le DOM
      const inputEmailUser = form.querySelector(`input[data-testid="admin-email-input"]`);
      expect(inputEmailUser).toBeTruthy();
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = form.querySelector(`input[data-testid="admin-password-input"]`);
      expect(inputPasswordUser).toBeTruthy();
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });

  // TESTS SUPPLÉMENTAIRES POUR 100% DE COUVERTURE
  describe("Given that I am a user on login page - Additional coverage tests", () => {
    
    describe("When login method is called with store", () => {
      test("Then it should call store.login and set jwt in localStorage", async () => {
        document.body.innerHTML = LoginUI();
        
        const mockStore = {
          login: jest.fn().mockResolvedValue({ jwt: "fake-jwt-token" })
        };
        
        // Mock localStorage
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate: jest.fn(),
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        const user = {
          email: "test@test.com",
          password: "password123"
        };
        
        await login.login(user);
        
        expect(mockStore.login).toHaveBeenCalledWith(JSON.stringify({
          email: user.email,
          password: user.password,
        }));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('jwt', 'fake-jwt-token');
      });
      
      test("Then it should return null when no store", () => {
        document.body.innerHTML = LoginUI();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate: jest.fn(),
          PREVIOUS_LOCATION: "",
          store: null,
        });
        
        const user = {
          email: "test@test.com",
          password: "password123"
        };
        
        const result = login.login(user);
        
        expect(result).toBeNull();
      });
    });

    describe("When createUser method is called with store", () => {
      test("Then it should call store.users.create and then login", async () => {
        document.body.innerHTML = LoginUI();
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        const mockStore = {
          users: jest.fn().mockReturnValue({
            create: jest.fn().mockResolvedValue({})
          }),
          login: jest.fn().mockResolvedValue({ jwt: "fake-jwt-token" })
        };
        
        // Mock localStorage
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate: jest.fn(),
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        const user = {
          type: "Employee",
          email: "newuser@test.com",
          password: "password123"
        };
        
        await login.createUser(user);
        
        expect(mockStore.users).toHaveBeenCalled();
        expect(mockStore.users().create).toHaveBeenCalledWith({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split('@')[0],
            email: user.email,
            password: user.password,
          })
        });
        expect(consoleSpy).toHaveBeenCalledWith(`User with ${user.email} is created`);
        
        consoleSpy.mockRestore();
      });
      
      test("Then it should return null when no store", () => {
        document.body.innerHTML = LoginUI();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate: jest.fn(),
          PREVIOUS_LOCATION: "",
          store: null,
        });
        
        const user = {
          type: "Employee",
          email: "test@test.com",
          password: "password123"
        };
        
        const result = login.createUser(user);
        
        expect(result).toBeNull();
      });
    });

    describe("When handleSubmitEmployee fails login and calls createUser", () => {
      test("Then it should catch error and call createUser", async () => {
        document.body.innerHTML = LoginUI();
        
        const mockStore = {
          login: jest.fn().mockRejectedValue(new Error("Login failed")),
          users: jest.fn().mockReturnValue({
            create: jest.fn().mockResolvedValue({})
          })
        };
        
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const onNavigate = jest.fn();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        // Spy sur createUser pour vérifier qu'elle est appelée
        const createUserSpy = jest.spyOn(login, 'createUser').mockResolvedValue({});
        
        const form = screen.getByTestId("form-employee");
        const emailInput = screen.getByTestId("employee-email-input");
        const passwordInput = screen.getByTestId("employee-password-input");
        
        fireEvent.change(emailInput, { target: { value: "test@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        
        await fireEvent.submit(form);
        
        // Attendre que les promesses se résolvent
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(createUserSpy).toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
        
        createUserSpy.mockRestore();
      });
    });

    describe("When handleSubmitAdmin fails login and calls createUser", () => {
      test("Then it should catch error and call createUser", async () => {
        document.body.innerHTML = LoginUI();
        
        const mockStore = {
          login: jest.fn().mockRejectedValue(new Error("Login failed")),
          users: jest.fn().mockReturnValue({
            create: jest.fn().mockResolvedValue({})
          })
        };
        
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
        });
        
        const onNavigate = jest.fn();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        // Spy sur createUser pour vérifier qu'elle est appelée
        const createUserSpy = jest.spyOn(login, 'createUser').mockResolvedValue({});
        
        const form = screen.getByTestId("form-admin");
        const emailInput = screen.getByTestId("admin-email-input");
        const passwordInput = screen.getByTestId("admin-password-input");
        
        fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        
        await fireEvent.submit(form);
        
        // Attendre que les promesses se résolvent
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(createUserSpy).toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Dashboard']);
        
        createUserSpy.mockRestore();
      });
    });

    describe("When login is successful", () => {
      test("Then handleSubmitEmployee should set background color to white", async () => {
        document.body.innerHTML = LoginUI();
        
        const mockStore = {
          login: jest.fn().mockResolvedValue({ jwt: "fake-jwt-token" })
        };
        
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const onNavigate = jest.fn();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        const form = screen.getByTestId("form-employee");
        const emailInput = screen.getByTestId("employee-email-input");
        const passwordInput = screen.getByTestId("employee-password-input");
        
        fireEvent.change(emailInput, { target: { value: "test@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        
        await fireEvent.submit(form);
        
        // Attendre que les promesses se résolvent
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Vérifier la couleur (peut être en format rgb ou hex)
        expect(document.body.style.backgroundColor).toMatch(/(#fff|rgb\(255,\s*255,\s*255\))/);
      });
      
      test("Then handleSubmitAdmin should set background color to white", async () => {
        document.body.innerHTML = LoginUI();
        
        const mockStore = {
          login: jest.fn().mockResolvedValue({ jwt: "fake-jwt-token" })
        };
        
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const onNavigate = jest.fn();
        
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: mockStore,
        });
        
        const form = screen.getByTestId("form-admin");
        const emailInput = screen.getByTestId("admin-email-input");
        const passwordInput = screen.getByTestId("admin-password-input");
        
        fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        
        await fireEvent.submit(form);
        
        // Attendre que les promesses se résolvent
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Vérifier la couleur (peut être en format rgb ou hex)
        expect(document.body.style.backgroundColor).toMatch(/(#fff|rgb\(255,\s*255,\s*255\))/);
      });
    });
  });
});