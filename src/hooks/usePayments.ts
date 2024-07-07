import { useEffect, useState } from "react";

export interface IPayment {
  id?: string;
  user: "Peppe" | "Chiara";
  paidFor: ["Peppe"] | ["Chiara"] | ["Peppe", "Chiara"];
  amount: number;
  forWhat: string;
}

const API_URL =
  "https://pigbank-api-server-761d5781bddb.herokuapp.com/v1/treecount";

  interface UsePaymentsProps {
    changed: boolean;
    filter?: Record<string, any>;
    options?: {
      limit?: number;
      skip?: number;
      page?: number;
      sortBy?: {
        [key: string]: "asc" | "desc";
      };
    };
  }

export const usePayments = ({ changed, filter = {}, options = {} }: UsePaymentsProps) => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});

  const [allPayments, setAllPayments] = useState<IPayment[]>([]);

  const getAllPayments = async () => {
    const response = await fetch(API_URL + "/all", { method: "GET" });
    const data = await response.json();
    setAllPayments(data);
  }

  const getPayments = async () => {
    setIsLoading(true); // Set loading to true when the operation starts
    try {
      const queryParams = new URLSearchParams({
        ...Object.entries(filter).reduce((acc: Record<string, string>, [key, value]) => {
          acc[`filter[${key}]`] = value.toString();
          return acc;
        }, {}),
        ...Object.entries(options).reduce((acc: Record<string, string>, [key, value]) => {
          acc[`options[${key}]`] = value.toString();
          return acc;
        }, {}),
      });

      console.log("XXXX",queryParams)

      const response = await fetch(`${API_URL}?${queryParams.toString()}`, { method: "GET" });
      const data = await response.json();
      setPayments(data.results);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    }

    await getAllPayments();

    setIsLoading(false); // Set loading to false when operation is done
  };
  const createPayment = async (payment: IPayment) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payment),
      });
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
        method: "DELETE",
      });
      await getPayments();
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
    setIsLoading(false);
  };

  const normalizeBalance = (balance: number) => {
    return Math.floor(balance * 100) / 100;
  };

  const patchPayment = async (
    paymentId: string,
    payment: Partial<IPayment>
  ) => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
      Chiara: number;
      Peppe: number;
      totChiaraPerEntrambi: number;
      totPeppePerEntrambi: number;
      totChiaraPerPeppe: number;
      totPeppePerChiara: number;
    } = {
      Chiara: 0,
      Peppe: 0,
      totChiaraPerEntrambi: 0,
      totPeppePerEntrambi: 0,
      totChiaraPerPeppe: 0,
      totPeppePerChiara: 0,
    };

    if(!allPayments) return

    allPayments?.forEach((payment) => {
      // subtract from paying user's balance
      if (payment.user === "Peppe") {
        // se ho pagato io per entrambi che succede?
        // chiara mi deve il 30% di quello che ho pagato, perché il 70% lo pago io.
        // Quindi prendo il totale e lo divido in due parti il 70 e il 30.
        // Se ho pagato 100€ per entrambi, io spendo 70€ e Chiara 30€.
        // questo significa che vado a credito da chiara di 30€,
        // per riportare la balance a 0, chiara deve darmi 30€.
        // quindi metto balance negativa a me -30%
        // e metto balance positiva a chiara +30% del pagato

        if (payment.paidFor.length === 2) {
          newBalances.totPeppePerEntrambi += payment.amount;

          newBalances.Peppe -= payment.amount * 0.3;
          newBalances.Chiara += payment.amount * 0.3;
        } else {
          newBalances.totPeppePerChiara += payment.amount;

          newBalances.Peppe -= payment.amount;
          newBalances.Chiara += payment.amount;
        }
      }

      // se invece a pagato Chiara per entrambi
      // io devo a Chiara il 70% di quello che ha pagato lei
      // quindi se lei ha pagato 100€
      // lei va a credito di 70€ da parte mia
      // per riportare la balance a 0 io devo darle 70€
      else {
        if (payment.paidFor.length === 2) {
          newBalances.totChiaraPerEntrambi += payment.amount;

          newBalances.Chiara -= payment.amount * 0.7;
          newBalances.Peppe += payment.amount * 0.7;
        } else {
          newBalances.totChiaraPerPeppe += payment.amount;

          newBalances.Chiara -= payment.amount;
          newBalances.Peppe += payment.amount;
        }
      }

      console.log(payment.paidFor, newBalances);
    });

    newBalances.Chiara = normalizeBalance(newBalances.Chiara);
    newBalances.Peppe = normalizeBalance(newBalances.Peppe);

    setBalances(newBalances);
  };

  useEffect(() => {
    getPayments();
    getAllPayments();
  }, [changed, options.page]);

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
  };
};
