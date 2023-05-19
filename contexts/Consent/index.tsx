import {createContext, useContext, useEffect, useState} from "react";
import { verifyMessage } from '@ethersproject/wallet'
import {WalletContext} from "../Wallet";
import {CurrentNetworkContext} from "../CurrentNetwork";

export type TConsentContext = {
  verifyTermsAcceptance: () => Promise<boolean>;
  requestTermsAcceptance: () => Promise<boolean>;
  termsAccepted: boolean | null;
}

const initialState: TConsentContext = {} as TConsentContext;

export const ConsentContext = createContext<TConsentContext>(initialState);

export const ConsentProvider = ({children}: any) => {
  const { networkId } = useContext(CurrentNetworkContext);
  const { wallet, accounts } = useContext(WalletContext);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null)

  const verifyTermsAcceptance = async () => {
    if (networkId && accounts && accounts[0]) {
      const key = `${networkId}-${accounts[0]}`
      try {
        const signature = localStorage.getItem(key);
        if (signature) {
          return fetch('/terms_short.txt')
            .then(res => res.ok?res.text():Promise.reject(res.status))
            .then(terms => verifyMessage(terms, signature))
            .then(signerAccount => {
              setTermsAccepted(!!signerAccount
                && (signerAccount.toLowerCase() === accounts[0].toLowerCase()));
              return signerAccount === accounts[0]
            })
            .catch(e => {
              console.log(e)
              setTermsAccepted(false);
              return false;
            });
        } else {
          setTermsAccepted(false);
          return false
        }
      } catch (e) {
        console.log(e);
        setTermsAccepted(false);
        return false
      }
    } else {
      setTermsAccepted(null);
      return false
    }
  }

  const requestTermsAcceptance = async () => {
    if (networkId && accounts && accounts[0]) {
      const key = `${networkId}-${accounts[0]}`
      try {
        const signer = wallet.getSigner();
        return fetch('/terms_short.txt')
          .then(res => res.ok?res.text():Promise.reject(res.status))
          .then(terms => signer.signMessage(terms))
          .then(val => localStorage.setItem(key, val))
          .then(_ => setTermsAccepted(true))
          .then(_ => true)
          .catch(_ => false);
      } catch (e) {
        console.log(e)
        return false;
      }
    } else {
      return false;
    }
  }

  useEffect(() => {
    verifyTermsAcceptance().then(_ => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termsAccepted, networkId, accounts])

  return (
    <ConsentContext.Provider value={{
      verifyTermsAcceptance,
      requestTermsAcceptance,
      termsAccepted
    }} >
      { children }
    </ConsentContext.Provider>
  )
}
