'use client';
import { useEffect, useState } from 'react';
import { createPublicClient, http, keccak256, toHex, getAddress, numberToHex, hexToBigInt, padHex, decodeAbiParameters } from 'viem'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
    chain: sepolia,
    transport: http(),
})

const CONSTRACT_ADDRESS = '0x7ade8333e92799ab60c6c8f2f9d308c4b3b5a1bf';

const START_HEX = keccak256(padHex(toHex(0), {size: 32}))
const START_NUMBER = hexToBigInt(START_HEX);

// 手动解析紧凑打包的数据
function parsePackedData(data: string): [bigint, string] {
  // 确保数据长度正确（32 字节 = 64 个十六进制字符 + '0x'前缀）
  if (data.length !== 66) {
    throw new Error('Invalid data length')
  }

  // 提取 uint64（8 字节 = 16 个十六进制字符）
  const uint64Hex = data.slice(2, 26)
  const uint64Value = BigInt('0x' + uint64Hex)

  // 提取地址（20 字节 = 40 个十六进制字符）
  const addressHex = data.slice(26)
  const address = getAddress('0x' + addressHex)

  return [uint64Value, address]
}

const GetStorageAt = () => {
    const [length, setLength] = useState<number>(0);
    const [list, setList] = useState<any[]>([]);

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

        const data1 = await getDataAt(index * 2)
        const data2 = await getDataAt(index * 2 + 1)

        const values2 = decodeAbiParameters([
          { name: 'amount', type: 'uint256' },
        ], data2 as `0x${string}`)

        const startTime = Number(parsePackedData(data1 as `0x${string}`)[0])
        const user = parsePackedData(data1 as `0x${string}`)[1]
        const amount = Number(values2)

        return [startTime, user, amount]
    }

    async function getDataAt(at: number) {
      const slot = numberToHex(START_NUMBER + BigInt(at))
      try {
        const data = await client.getStorageAt({
          address: CONSTRACT_ADDRESS,
          slot: slot as `0x${string}`
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
    })

    useEffect(() => {
        // 获取 _locks 的数据
        if(length === 0) return
        const _list: any = []
        for(let i = 0; i < length; i++) {
            getStorageByIndex(i).then(res => {
              const [startTime, user, amount] = res
              _list.push(res)
              console.log(_list);
              if(_list.length === length) {
                setList(_list.sort((a: any, b: any) => b[0] - a[0]))
              }
            })
        }
        
    }, [length])
    return <div className='p-4'>
        <h1 className='text-2xl text-center mb-4'>获取合约的存储数据</h1>
        <div>
            合约地址: 
            <a href={"https://sepolia.etherscan.io/address/" + CONSTRACT_ADDRESS} target='_blank'>{CONSTRACT_ADDRESS}</a>
        </div>
        <div>
            _locks 的长度为: {length}
        </div>
        <ul>
            {
              list.length === 0 ? <div>正在查询中，请稍候……</div> :
              list.map((item: any, index: number) => {
                  return <li key={index}>
                      locks[{index}]: user: {item[1]}, startTime:{item[0]}, amount:{item[2]}
                  </li>
              })
            }
        </ul>
    </div>
}
export default GetStorageAt;