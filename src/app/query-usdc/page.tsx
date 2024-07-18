'use client';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`),
})

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48';

const QueryUsdcPage = () => {
    const [lastBlock, setLastBlock] = useState<number>(0);
    const [list, setList] = useState<any[]>([]);
    useEffect(() => {
        // 获取最新的区块高度
        client.getBlockNumber().then((res: BigInt) => {
            setLastBlock(Number(res));
        })
    }, [])
    useEffect(() => {
        // 获取最新的100个区块内的 USDC Transfer 记录
        client.getLogs({
            address: USDC_ADDRESS,
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            fromBlock: BigInt(lastBlock > 100 ? lastBlock - 100 : 0),
            toBlock: BigInt(lastBlock)
        }).then((res) => {
            setList(res);
            console.log(res)
        })
    }, [lastBlock])
    return <div className='p-4'>
        <h1 className='text-2xl text-center mb-4'>查询 Ethereum 链上最近 100 个区块链内的 USDC Transfer 记录</h1>
        <div className='text-gray-400 mb-2'>
            最新的区块为: {lastBlock || ''}，最近 100 个区块共查询到 {list.length} 条记录
        </div>
        {
            list.length === 0 ? <div className='text-gray-600'>正在查询中，请稍候……</div> : 
            <ul className='list-disc pl-4'>
                {list.map((item: any, index: number) => {
                    return <li key={index}>
                        从 {item.args.from} 转账给 {item.args.to} {parseInt(item.args.value) / 1000000} USDC ,交易ID：{item.transactionHash}
                    </li>
                })}
            </ul>
        }
    </div>
}
export default QueryUsdcPage;