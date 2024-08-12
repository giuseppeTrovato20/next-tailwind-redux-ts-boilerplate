'use client'
/* eslint-disable react/jsx-key */
import { usePayments } from "@/hooks/usePayments";
import { useState } from "react";

const normalizeBalance = (balance: number) => {
  return Math.floor(balance * 100) / 100;
};

const PAGE_SIZE = 6;

export const HelloWorld = () => {
  const [changed, setChanged] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [user, setUser] = useState<"Peppe" | "Chiara">("Chiara");
  const [amount, setAmount] = useState<number>();
  const [paidFor, setPaidFor] = useState<
    ["Peppe"] | ["Chiara"] | ["Peppe", "Chiara"]
  >(["Peppe", "Chiara"]);
  const [paidForSelect, setPaidForSelect] = useState<string>("Per entrambi");
  const [forWhat, setForWhat] = useState<string>("");

  const [editModeId, setEditModeId] = useState<string>("");

  const handleSubmit = () => {
    if (forWhat && user && amount && paidFor) {
      if (editModeId !== "" && editModeId !== undefined) {
        patchPayment(editModeId, {
          user,
          amount,
          paidFor,
          forWhat,
        });
      } else {
        createPayment({
          user,
          amount,
          paidFor,
          forWhat,
        });
      }

      setUser("Chiara");
      setAmount(undefined);
      setPaidFor(["Peppe", "Chiara"]);
      setForWhat("");
      setEditModeId("");
      setShowModal(false);
    } else {
      alert("Per favore, riempi tutti i campi.");
    }
  };

  const handleChangePaidFor = (paidFor: string) => {
    setPaidForSelect(paidFor);

    switch (paidFor) {
      case "Per entrambi":
        setPaidFor(["Peppe", "Chiara"]);
        break;
      case "Per Peppe":
        setPaidFor(["Peppe"]);
        break;
      case "Per Chiara":
        setPaidFor(["Chiara"]);
        break;
    }
  };

  const {
    balances,
    payments,
    isLoading,
    createPayment,
    patchPayment,
    deletePayment,
  } = usePayments({
    changed,
    filter: {},
    options: {
      limit: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      page: currentPage,
    },
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  const showBalance = () => {
    const positiveUser = balances.Chiara > balances.Peppe ? "Peppe" : "Chiara";
    const negativeUser = balances.Chiara > balances.Peppe ? "Chiara" : "Peppe";

    if (balances[negativeUser] === 0) return <h4>Conti apppareggiatiiii</h4>;

    return (
      <h4 style={{ borderBottom: "1px solid black" }} className="mb-8">
        <span
          className={negativeUser === "Chiara" ? "text-primary" : "text-accent"}
        >
          {negativeUser}
        </span>
        {` deve a `}{" "}
        <span
          className={positiveUser === "Chiara" ? "text-primary" : "text-accent"}
        >
          {positiveUser}
        </span>
        :{" "}
        <span
          className={positiveUser === "Peppe" ? "text-accent" : "text-primary"}
        >{`${balances[negativeUser]}$`}</span>
      </h4>
    );
  };

  const showCalculations = () => {
    const totaleChiara =
      normalizeBalance(balances.totChiaraPerEntrambi * 0.6) +
      balances.totChiaraPerPeppe;
    const totalePeppe =
      normalizeBalance(balances.totPeppePerEntrambi * 0.4) +
      balances.totPeppePerChiara;

    return (
      <>
        <span className="mt-32" style={{ borderBottom: "1px solid black" }}>
          Totale Chiara per entrambi: {balances.totChiaraPerEntrambi} di questi
          peppe deve pagare il 60%, quindi{" "}
          {normalizeBalance(balances.totChiaraPerEntrambi * 0.6)}€
        </span>
        <span>
          Totale Chiara per Peppe: {balances.totChiaraPerPeppe} - paga per
          intero
        </span>

        <br />
        <span style={{ borderBottom: "1px solid black" }}>
          Totale Peppe per entrambi: {balances.totPeppePerEntrambi} di questi
          peppe deve pagare il 40%, quindi{" "}
          {normalizeBalance(balances.totPeppePerEntrambi * 0.4)}€
        </span>
        <span>
          Totale Peppe per Chiara: {balances.totPeppePerChiara} - paga per
          intero
        </span>

        <br />

        <span>
          Quindi = {normalizeBalance(balances.totChiaraPerEntrambi * 0.6)} +{" "}
          {normalizeBalance(balances.totChiaraPerPeppe)} = {totaleChiara}€
        </span>
        <br />
        <span>
          <span>
            Quindi = {normalizeBalance(balances.totPeppePerEntrambi * 0.4)} +{" "}
            {normalizeBalance(balances.totPeppePerChiara)} = {totalePeppe}€
          </span>
        </span>
        <br />

        <span>
          {totaleChiara > totalePeppe ? (
            <span>
              {normalizeBalance(totaleChiara)} - {normalizeBalance(totalePeppe)} ={" "}
              {normalizeBalance(totaleChiara - totalePeppe)}
            </span>
          ) : (
            <span>
              {normalizeBalance(totalePeppe)} - {normalizeBalance(totaleChiara)} ={" "}
              {normalizeBalance(totalePeppe - totaleChiara)}
            </span>
          )}{" "}
        </span>
        <br />
        {showBalance()}
      </>
    );
  };

  const handleAddNewExpanse = () => {
    setShowModal(true);
    setPaidFor(["Peppe", "Chiara"]);
    setPaidForSelect("Per entrambi");
  };

  const editModal = ({
    id,
    user,
    amount,
    paidFor,
    forWhat,
  }: {
    id: string | undefined;
    user: "Peppe" | "Chiara";
    amount: number;
    paidFor: ["Peppe"] | ["Chiara"] | ["Peppe", "Chiara"];
    forWhat: string;
  }) => {
    setShowModal(true);

    setUser(user);
    setAmount(amount);
    setPaidFor(paidFor);
    setPaidForSelect(
      paidFor.toString() === ["Peppe"].toString()
        ? "Per Peppe"
        : paidFor.toString() === ["Chiara"].toString()
        ? "Per Chiara"
        : "Per entrambi"
    );
    setForWhat(forWhat);
    setEditModeId(id ? id : "");
  };

  return (
    <div className="flex flex-col justify-center items-start min-h-screen p-4 pt-4 pb-32">
      {showBalance()}

      <table className="border-black  border-2 p-4 table table-xs">
        <tr className="border-black bg-neutral text-accent border-2 p-4">
          <th className="border-black border-2 ">Modifica</th>
          <th className="border-black ">Chi</th>
          <th className="border-black border-2  ">Per cosa</th>
          <th className="border-black border-2 ">€€</th>
          <th className="border-black border-2 ">Per chi</th>
        </tr>
        {payments?.map((p, i) => (
          <tr key={i} className="border-black border-2 p-4">
            <td className="border-black border-2">
              <button
                onClick={() =>
                  editModal({
                    id: p.id,
                    user: p.user,
                    amount: p.amount,
                    paidFor: p.paidFor,
                    forWhat: p.forWhat,
                  })
                }
                className="btn btn-accent p-1 mr-1 h-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="16"
                  viewBox="0 0 512 512"
                >
                  <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                </svg>
              </button>
              <button
                onClick={() => (p.id ? deletePayment(p.id) : null)}
                className="btn btn-error p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="14"
                  viewBox="0 0 448 512"
                >
                  <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                </svg>
              </button>
            </td>
            <td className={p.user == "Chiara" ? "text-primary" : "text-accent"}>
              {p.user}
            </td>
            <td className="border-black border-2 p-2">{p.forWhat}</td>
            <td
              className={
                p.user == "Chiara"
                  ? "border-black border-2 p-2 text-primary"
                  : "border-black border-2 p-2 text-accent"
              }
            >
              {p.amount}€
            </td>
            <td className="border-black border-2 p-2">
              {p.paidFor.map((user) => (
                <span
                  className={user === "Chiara" ? "text-primary" : "text-accent"}
                >
                  {user}
                  <br />
                </span>
              ))}
            </td>
          </tr>
        ))}
      </table>

      <br />

      <div className="pagination mt-2">
        {currentPage !== 1 && <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-primary"
        >
          Più nuovi
        </button>}
        <span className="mx-4">Page {currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={payments.length < PAGE_SIZE}
          className="btn btn-primary"
        >
          Più vecchi
        </button>
      </div>

      {showCalculations()}

      <button
        className="btn btn-accent mx-4 fixed bottom-8 right-0 left-0 md:w-64"
        onClick={handleAddNewExpanse}
      >
        Aggiungi nuova spesa
      </button>

      <dialog
        id="my_modal_1"
        className={
          "modal flex justify-center items-center p-8 " +
          (showModal ? "modal-open" : "")
        }
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {editModeId !== "" ? "Modifica spesa" : "Aggiungi nuova spesa"}
          </h3>
          <form>
            <div className="flex flex-col gap-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Cosa? </span>
                </div>
                <input
                  type="text"
                  value={forWhat}
                  onChange={(e) => setForWhat(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                  required
                />
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Pagato da</span>
                </div>
                <select
                  value={user}
                  onChange={(e) =>
                    setUser(e.target.value as "Chiara" | "Peppe")
                  }
                  className="select select-bordered"
                  required
                >
                  <option value="">Seleziona un utente</option>
                  <option value="Chiara">Chiara</option>
                  <option value="Peppe">Peppe</option>
                </select>
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Quanto? </span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input input-bordered w-full max-w-xs"
                  required
                />
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Per chi</span>
                </div>
                <select
                  value={paidForSelect}
                  onChange={(e) => handleChangePaidFor(e.target.value)}
                  className="select select-bordered"
                  required
                >
                  <option value="">Seleziona per chi</option>
                  <option value="Per entrambi">Per entrambi</option>
                  <option>Per {user === "Chiara" ? "Peppe" : "Chiara"}</option>
                </select>
              </label>
            </div>
            <div className="modal-action">
              <button
                className="btn mr-4"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Chiudi
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editModeId === "" ? "Aggiungi" : "Modifica"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default HelloWorld;
