'use client'
import ConnectButton from "@/components/ConnectButton";
import { useEffect } from "react";
import { useAccount } from 'wagmi'

export default function Home() {
  const account = useAccount();
  // console.log(account);

  useEffect(() => {
    console.log(account);
  })
  
  return (
    <div className='p-4'>
      <ConnectButton />

      <div className='mt-2'>
        {
          account.address ?
          <p>Address：{account.address}</p> :
          <p className='text-red-600'>Not connected yet, please click the button above to connect your wallet.</p>
        }
        
      </div>
    </div>
  );
}
