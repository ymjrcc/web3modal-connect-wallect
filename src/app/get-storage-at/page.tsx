'use client';
import { useEffect, useState } from 'react';
import { createPublicClient, http, keccak256, toHex, stringToHex, numberToHex, hexToBigInt, padHex, decodeAbiParameters } from 'viem'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
    chain: sepolia,
    transport: http(),
})

const CONSTRACT_ADDRESS = '0x7ade8333e92799ab60c6c8f2f9d308c4b3b5a1bf';

const START_HEX = keccak256(padHex(toHex(0), {size: 32}))
const START_NUMBER = hexToBigInt(START_HEX);

const GetStorageAt = () => {
    const [length, setLength] = useState<number>(0);

    async function getLength() {
        try {
            const data = await client.getStorageAt({
                address: CONSTRACT_ADDRESS,
                slot: '0x0'
            })
            const length = hexToBigInt(data as `0x${string}`)
            setLength(Number(length))
        } catch (error) {
            console.error('Error fetching storage data:', error)
            throw error
        }
    }

    async function getStorageByIndex(index: number) {

        const data1 = await getStorageAt(numberToHex(START_NUMBER + BigInt(index)).slice(2))
        const data2 = await getStorageAt(numberToHex(START_NUMBER + BigInt(index + 1)).slice(2))

        console.log(data1, data2);
    }

    async function getStorageAt(slot: string | number) {
      // const slot = getStorageAt(numberToHex(START_NUMBER + BigInt(_slot)).slice(2))
      try {
        const data = await client.getStorageAt({
          address: CONSTRACT_ADDRESS,
          slot: `0x${slot}`
        })
        return data
      } catch (error) {
        console.error('Error fetching storage data:', error)
        throw error
      }
    }

    useEffect(() => {

        // 获取 _locks 的长度
        getLength()

        // 获取第一个 _locks 的数据
        getStorageByIndex(0)
        
        
    })
    return <div className='p-4'>
        <h1 className='text-2xl text-center mb-4'>获取合约的存储数据</h1>
        <div>
            合约地址: 
            <a href={"https://sepolia.etherscan.io/address/" + CONSTRACT_ADDRESS} target='_blank'>{CONSTRACT_ADDRESS}</a>
        </div>
        <div>
            _locks 的长度为: {length}
        </div>
    </div>
}
export default GetStorageAt;