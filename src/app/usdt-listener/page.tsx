'use client';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`),
})

const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';

const QueryUSDTPage = () => {
    const [lastBlock, setLastBlock] = useState<number>(0);
    const [lashBlockHash, setLastBlockHash] = useState<string>('');
    const [list, setList] = useState<any[]>([]);

    useEffect(() => {
        // 监听最新区块
        client.watchBlocks({
            emitOnBegin: true,
            onBlock(block) {
                setLastBlock(Number(block.number));
                setLastBlockHash(block.hash);
            }
        })
    }, [])
    useEffect(() => {
        setList([]);
        // 获取最新区块内的 USDT Transfer 记录
        client.getLogs({
            address: USDT_ADDRESS,
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            fromBlock: BigInt(lastBlock),
            toBlock: BigInt(lastBlock)
        }).then((res) => {
            setList(res);
            console.log(res)
        })
    }, [lastBlock])
    return <div className='p-4'>
        <h1 className='text-2xl text-center mb-4'>监听最新 USDT 转账流水和最新区块信息</h1>
        <div className='text-gray-400 mb-2'>
            最新的区块为: {lastBlock ? `${lastBlock} (${lashBlockHash})` : ''}
            <br />
            该区块下共查询到 {list.length} 条记录
        </div>
        {
            list.length === 0 ? <div className='text-gray-600'>正在查询中，请稍候……</div> :
                <ul className='list-disc pl-4'>
                    {list.map((item: any, index: number) => {
                        return <li key={index}>
                            在 {lastBlock} 区块 {item.transactionHash} 交易中从 {item.args.from} 转账 {parseInt(item.args.value) / 1000000} USDT 到 {item.args.to}
                        </li>
                    })}
                </ul>
        }
    </div>
}
export default QueryUSDTPage;