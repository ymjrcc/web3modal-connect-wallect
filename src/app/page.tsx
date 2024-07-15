'use client'
import ConnectButton from "@/components/ConnectButton";
import { useState } from "react";
import { useAccountEffect } from 'wagmi'

export default function Home() {
  const [accountData, setAccountData] = useState<any>(null);

  useAccountEffect({
    onConnect(data) {
      console.log('Connected!', data)
      setAccountData(data);
    },
    onDisconnect() {
      console.log('Disconnected!')
      setAccountData(null);
    },
  })
  
  return (
    <div className='p-4'>
      <ConnectButton />
      <div className='mt-2'>
        {
          accountData ?
          <div>
            <div>Connected Address：{accountData.address}</div>
            <div>Authorized Addresses：
              <ul className='list-disc pl-8'>
                {accountData.addresses.map((address: string) => (
                  <li key={address}>{address}</li>
                ))}
              </ul>
            </div>
            <br />
          </div>:
          <div className='text-red-600'>Not connected yet, please click the button above to connect your wallet.</div>
        }
      </div>
    </div>
  );
}
