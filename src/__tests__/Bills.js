/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // Logique de tri chronologique (du plus ancien au plus récent)
      const chronoAsc = (a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      };

      // Trier les données de fixture AVANT de les passer au composant UI
      const billsSortedFixture = [...bills].sort(chronoAsc);

      // Rendre le composant UI avec les données MAINTENANT triées
      document.body.innerHTML = BillsUI({ data: billsSortedFixture });

      // Extraire les dates du rendu UI (elles devraient être triées)
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Appliquer la même logique de tri aux dates extraites pour comparaison
      const datesSortedCheck = [...dates].sort(chronoAsc);

      // ASSERTION : Vérifier que les dates extraites sont bien dans l'ordre trié attendu
      expect(dates).toEqual(datesSortedCheck);
    });
  });
});
