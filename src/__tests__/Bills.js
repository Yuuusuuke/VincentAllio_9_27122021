import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import store from "../__mocks__/store"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH } from "../constants/routes";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const user = JSON.stringify({
        type: 'Employee'
      })
      window.localStorage.setItem('user', user)
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      var icon = screen.getByTestId("icon-window");

      expect(icon.className).toBe("active-icon");
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- \.](0[1-9]|1[012])[- \.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("The page is loading", () => {
      const html = BillsUI({data: [], loading: true});
      document.body.innerHTML = html;
      expect(screen.getByText("Loading...")).toBeTruthy;
    })

    test("The page throw an error", () => {
      const html = BillsUI({data: [], error: 404});
      document.body.innerHTML = html;
      expect(screen.getByText("404")).toBeTruthy;
    })

    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(store, "get")
      const bills = await store.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
   })
   test("fetches bills from an API and fails with 404 message error", async () => {
     store.get.mockImplementationOnce(() =>
       Promise.reject(new Error("Erreur 404"))
     )
     const html = BillsUI({ error: "Erreur 404" })
     document.body.innerHTML = html
     const message = await screen.getByText(/Erreur 404/)
     expect(message).toBeTruthy()
   })
   test("fetches messages from an API and fails with 500 message error", async () => {
     store.get.mockImplementationOnce(() =>
       Promise.reject(new Error("Erreur 500"))
     )
     const html = BillsUI({ error: "Erreur 500" })
     document.body.innerHTML = html
     const message = await screen.getByText(/Erreur 500/)
     expect(message).toBeTruthy()
   })

   describe("When clicking on add a new bill", () => {
     test("Then bill form should be opened", () => {
      const html = BillsUI({data: []});
      document.body.innerHTML = html;
      const bill = new Bills({document, onNavigate, store: null, bills, localStorage: window.localStorage});
      screen.getByTestId("btn-new-bill").addEventListener("click", bill.handleClickNewBill);
      userEvent.click(screen.getByTestId("btn-new-bill"));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy;
     })
   })
  })

  describe("When clicking on an eye icon", () => {
    const bill = new Bills({document, onNavigate, store: null, bills, localStorage: window.localStorage});
    const html = BillsUI({data: bills});
    test("Then modal pop", () => {
      document.body.innerHTML = html;
      $.fn.modal = jest.fn();
      const icon = screen.getAllByTestId("icon-eye")[0];
      icon.addEventListener("click", bill.handleClickIconEye(icon));
      userEvent.click(icon);
      expect(document.querySelector("#modaleFile")).toBeTruthy();
    })
  })
})