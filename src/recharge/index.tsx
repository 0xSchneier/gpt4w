import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toHex } from './utils';

const tokenList = [
  { img: '/assets/ETH.png', name: 'ETH' },
  { img: '/assets/USDT.png', name: 'USDT' }
]
function App () {
  const [ token, setToken ] = useState(0)

  return (
    <div className='w-[100vw] h-[100vh] bg-[#F4F7FA]'>
      <header className='flex items-center w-[800px] py-[36px] mx-auto'>
        <img className='w-[36px] h-[36px]' src="/assets/recharge.png" alt="icon" />
        <span className='ml-[5px] text-[18px]'>$$$$$</span>
      </header>
      <div className='w-[640px] px-[48px] py-[24px] min-h-[500px] bg-[#ffffff] rounded-[16px] mx-auto mt-[20px] shadow-input shadow-slate-300'>
        <h2 className='text-[24px] !font-bold'>To up to GPT4W</h2>
        <div className='recharge-box mt-[60px] mb-[30px]'>
          <span className='key'>Top-up Amount</span>
          <div className='value'>
            <input className='p-[10px] text-center mr-[12px] inline-block w-[150px] h-[40px] font-[24px] text-[#a2a2a2] border-[#a2a2a2] border-[1px] rounded-md outline-none hover:shadow-lg ' />
            <span className='text-[20px]'>Credits</span>
          </div>
          <span className='key'>Payment Method</span>
          <div className='value'>
            <span className='radio active mr-[16px]'></span>
            <img className='w-[36px] h-[36px] mr-[8px]' src="/assets/metamask.png" alt="metamask" />
            <span className='font-bold'>MetaMask</span>
          </div>
          <span className='key'>Payment</span>
          <div className='value'>
            <span className='mr-[16px] text-[24px]'>0</span>
            <div className='cursor-pointer relative w-[150px] flex items-center border-[1px] rounded-md border-[#a2a2a2] px-[16px] py-[8px] group'>
              <img className='w-[16px] h-[16px] mr-[16px]' src={tokenList[token].img} alt="token" />
              <span className='mr-[16px]'>{tokenList[token].name}</span>
              <span className='select-icon'></span>
              <div className='select-option absolute h-0 top-[105%] overflow-hidden right-0 bg-[#ffffff] shadow-input rounded-md group-hover:h-auto'>
                {
                  tokenList.map((t, i) => (
                    <div className='flex items-center w-[150px] py-[12px] px-[16px]' key={t.name} onClick={() => setToken(i)}>
                      <img className='w-[16px] h-[16px] mr-[16px]' src={t.img} alt={t.name} />
                      <span>{t.name}</span>
                      {token === i ? <span className='absolute right-[16px] text-[#75A7F9]'>√</span> : null}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <div className='mb-[80px] flex items-center justify-end text-[14px]'>
          <div className='inline-flex items-center text-[#75A7F9] cursor-pointer'>
            <span className='inline-flex items-center justify-center w-[18px] h-[18px] border-[1.5px] border-[#75A7F9] rounded-full'>i</span><span className='ml-[8px] mr-[16px]'>CURRENCY RATE</span>
          </div>
          <span className='text-[#A2A2A2]'>1ETH = 1893.46 Credits</span>
        </div>
        <button className='block mx-auto w-[300px] bg-[#5391F7] rounded-md text-[#ffffff] p-[12px] hover:bg-opacity-80'>
          Connect to Wallet
        </button>
      </div>
    </div>
  )
}

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(
  <App />
);
