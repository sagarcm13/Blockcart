import { useState, useEffect } from 'react'

// eslint-disable-next-line react/prop-types
export default function ProductLeft({ data }) {
  const [productData, setProductData] = useState(data);
  useEffect(() => {
    setProductData(data);
  }, [data])
  if (productData === undefined) {
    return <div>Loading...</div>;
  } else
    return (
      <div className='md:w-[40%] md:float-left '>
        <div className="m-8">
          <img className='md:ml-8 md:w-[500px] w-screen h-auto' id='mainImg'
            src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${productData.imageHashes[0]}`}
            alt="" />
        </div>
        <div className="flex m-5 md:space-x-16">
          <div className="border-2 m-2 flex justify-center">
            <img className='w-[220px] h-auto mt-5 cursor-pointer' id='smallImg1'
              src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${productData.imageHashes[0]}`}
              onClick={() => {
                document.getElementById('mainImg').src = document.getElementById('smallImg1').src
              }} alt="" />
          </div>
          <div className="border-2 m-2 flex justify-center">
            <img className='w-[220px] h-auto mt-5 cursor-pointer' id='smallImg2'
              src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${productData.imageHashes[1]}`}
              onClick={() => {
                document.getElementById('mainImg').src = document.getElementById('smallImg2').src
              }} alt="" />
          </div>
          <div className="border-2 m-2 flex justify-center">
            <img className='w-[220px] h-auto mt-5 cursor-pointer' id='smallImg3'
              src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${productData.imageHashes[2]}`}
              onClick={() => {
                document.getElementById('mainImg').src = document.getElementById('smallImg3').src
              }} alt="" />
          </div>
          <div className="border-2 m-2 flex justify-center">
            <img className='w-[220px] h-auto mt-5 cursor-pointer' id='smallImg4'
              src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${productData.imageHashes[3]}`}
              onClick={() => {
                document.getElementById('mainImg').src = document.getElementById('smallImg4').src
              }} alt="" />
          </div>
        </div>
      </div>
    )
}
