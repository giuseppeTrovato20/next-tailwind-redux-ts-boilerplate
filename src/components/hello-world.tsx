"use client"

import { usePayments } from "@/hooks/usePayments";
import { useState } from "react";

export const HelloWorld = () => {

  const [changed, setChanged] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

  const [user, setUser] = useState<'Giuseppe' | 'Chiara'>('Chiara');
  const [amount, setAmount] = useState<number>(0);
  const [paidFor, setPaidFor] = useState<['Giuseppe'] | ['Chiara'] | ['Giuseppe', 'Chiara']>(['Giuseppe', 'Chiara'])
  const [paidForSelect, setPaidForSelect] = useState<string>('Per entrambi')
  const [forWhat, setForWhat] = useState<string>('')

  const handleSubmit = () => {

    if(forWhat && user && amount && paidFor) {
      createPayment({
        user,
        amount,
        paidFor,
        forWhat
      })
      console.log("Form inviato");
      setShowModal(false);
    } else {
      alert("Per favore, riempi tutti i campi.");
    }
  }

  const handleChangePaidFor = (paidFor: string) => {

    setPaidForSelect(paidFor)

    switch(paidFor) {
      case 'Per entrambi':
        setPaidFor(['Giuseppe','Chiara'])
        break;
      case 'Per Giuseppe':
        setPaidFor(['Giuseppe'])
        break;
      case 'Per Chiara':
        setPaidFor(['Chiara'])
        break;
    }
  }

  const { balances, payments, isLoading, createPayment } = usePayments({ changed });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const showBalance = () => {

    const positiveUser = balances.Chiara > balances.Giuseppe ? 'Giuseppe' : 'Chiara';
    const negativeUser = balances.Chiara > balances.Giuseppe ? 'Chiara' : 'Giuseppe';

    if (balances[negativeUser] === 0)
      return <h4>Conti apppareggiatiiii</h4>

    return <h4>{`${negativeUser} deve a ${positiveUser} ${balances[negativeUser]}€` }</h4>
  }

  return (
    <div className="grid justify-center items-center h-screen">

      {showBalance()}

      <table className="border-black  border-2 p-4 table table-xs">
        <tr className="border-black bg-neutral text-accent border-2 p-4">
          <th className="border-black  p-4 hidden md:block" p-4>Chi ha pagato</th>
          <th className="border-black border-2 p-4" p-4>Per cosa</th>
          <th className="border-black border-2 p-4" p-4>Quanto</th>
          <th className="border-black border-2 p-4" p-4>Per chi</th>
        </tr>
        {payments?.map((p, i) => <tr key={i} className="border-black border-2 p-4">
          <td className="border-black  p-4 hidden md:block">{p.user}</td>
          <td className="border-black border-2 p-4">{p.forWhat}</td>
          <td className="border-black border-2 p-4">{p.amount}€</td>
          <td className="border-black border-2 p-4">{p.paidFor.map(user => <span>{user}<br /></span>)}</td>
        </tr>)}
      </table>

      <div className="container mt-8">
        <button className="btn btn-accent" onClick={() => { setShowModal(true), console.log(showModal) }}>Aggiungi nuovo pagamento</button>
      </div>

      <dialog id="my_modal_1" className={"modal flex justify-center items-center p-8 " + (showModal ? 'modal-open' : '')}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Aggiungi nuova spesa</h3>
          <form>
            <div className="flex flex-col gap-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Cosa? </span>
                </div>
                <input type="text" value={forWhat} onChange={(e) => setForWhat(e.target.value)} className="input input-bordered w-full max-w-xs" required />
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Pagato da</span>
                </div>
                <select value={user} onChange={(e) => setUser(e.target.value as 'Chiara' | 'Giuseppe')} className="select select-bordered" required>
                  <option value="">Seleziona un utente</option>
                  <option value="Chiara">Chiara</option>
                  <option value="Giuseppe">Giuseppe</option>
                </select>
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Quanto? </span>
                </div>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input input-bordered w-full max-w-xs" required />
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Per chi</span>
                </div>
                <select value={paidForSelect} onChange={(e) => handleChangePaidFor(e.target.value)} className="select select-bordered" required>
                  <option value="">Seleziona per chi</option>
                  <option value="Per entrambi">Per entrambi</option>
                  <option>Per {user === 'Chiara' ? 'Giuseppe' : 'Chiara'}</option>
                </select>
              </label>
            </div>
            <div className="modal-action">
              <button className="btn mr-4" type="button" onClick={() => setShowModal(false)}>Chiudi</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Aggiungi</button>
            </div>
          </form>
        </div>
      </dialog>


    </div>
  );
}

export default HelloWorld;