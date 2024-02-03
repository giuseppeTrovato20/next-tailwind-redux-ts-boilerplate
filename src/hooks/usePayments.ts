"use client"
import { useEffect, useState } from "react";

export interface IPayment {
    id?: string,
    user: 'Peppe' | 'Chiara',
    paidFor: ['Peppe'] | ['Chiara'] | ['Peppe', 'Chiara']
    amount: number,
    forWhat: string
}

const API_URL = 'https://pigbank-api-server-761d5781bddb.herokuapp.com/v1/treecount'

export const usePayments = ({changed}: {changed: boolean}) => {

  const [payments, setPayments] = useState<IPayment[]>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [balances, setBalances] = useState<{[key: string]: number}>({});

  const getPayments = async () => {
    setIsLoading(true); // Set loading to true when the operation starts
    try {
      const response = await fetch(API_URL, { method: 'GET' });
      const data = await response.json();
      setPayments(data);
        
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    }
    setIsLoading(false); // Set loading to false when operation is done
  }

  const createPayment = async (payment: IPayment) => {

    await setTimeout( () => console.log('gang'), 5000)
    

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });
      await setTimeout( () => console.log(res), 5000)
      await setTimeout( () => console.log(res), 5000)
      await getPayments();
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
    setIsLoading(false);
  };

  const deletePayment = async (paymentId: string) => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/${paymentId}`, {
        method: 'DELETE',
      });
      await getPayments();
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
    setIsLoading(false);
  };

  const normalizeBalance = (balance: number) => {
    return Math.floor(balance * 100) / 100;
  }

  const patchPayment = async (paymentId: string, payment: Partial<IPayment>) => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });
      await getPayments();
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
    setIsLoading(false);
  };

  const balance = () => {
    const newBalances: {
        Chiara: number, Peppe: number
    } = {
        Chiara: 0, Peppe: 0
    };

    payments?.forEach(payment => {
      // subtract from paying user's balance
      if(payment.user === 'Peppe'){

          if(payment.paidFor.length === 2) {
            newBalances.Peppe -= payment.amount * 0.7;
            newBalances.Chiara += payment.amount * 0.3;
          } else {
            newBalances.Peppe -= payment.amount;
            newBalances.Chiara += payment.amount;
          }
      }
      else {

        if(payment.paidFor.length === 2) {
            newBalances.Chiara -= payment.amount * 0.3;
            newBalances.Peppe += payment.amount * 0.7;
        } else {
            newBalances.Chiara -= payment.amount;
            newBalances.Peppe += payment.amount;
        }

      }

    });

    newBalances.Chiara = normalizeBalance(newBalances.Chiara)
    newBalances.Peppe = normalizeBalance(newBalances.Peppe)

    setBalances(newBalances);
  } 

  useEffect(() => {

    getPayments()


  }, [changed])

  useEffect(() => {
    balance(); 
  }, [isLoading]);

  return {
    payments,
    balances,
    isLoading,
    getPayments,
    createPayment,
    deletePayment,
    patchPayment,
  }
};