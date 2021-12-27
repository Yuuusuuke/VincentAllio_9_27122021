import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";


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
});