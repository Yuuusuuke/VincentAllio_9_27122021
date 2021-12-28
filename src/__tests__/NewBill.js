import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";
import { ROUTES } from "../constants/routes";
import Store from "../app/Store";

window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee"
  })
);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am a user connected as Employee", () => {
  describe("When I post a bill", () => {
    test("Then there should be 1 more", async () => {
      const postSpy = jest.spyOn(store, "post");
      const newBillForTest = {
        id: "ZeKy5Mo4jkmdfPGYpTxB",
        vat: "",
        amount: 180,
        name: "test post",
        fileName: "tester",
        commentary: "ceci est un test",
        pct: 20,
        type: " Services en ligne",
        email: "test@test.com",
        fileUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
        date: "2019-06-04",
        status: "pending",
        commentAdmin: "just testing",
      };
      const allBills = await store.post(newBillForTest);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(allBills.data.length).toBe(5);
    });

    test("Then should fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("Then should fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

  describe("When I'm on new bill form", () => {
    describe("When I click on submit button", () => {
      test("Then function handleSubmit should be called", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          store: Store,
          localStorage: window.localStorage
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
      })
    });

    describe("When I upload a file", () => {
      test("Then function handleChangeFile should be called", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          store: Store,
          localStorage: window.localStorage
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");

        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["image"], "test.png", { type: "image/png" })]
          }
        });
        expect(handleChangeFile).toHaveBeenCalled();
      });
    });
  })
});