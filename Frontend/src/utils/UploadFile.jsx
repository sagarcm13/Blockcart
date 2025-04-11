import { useState } from 'react';
import pinata from './../pinata.js'; 

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [cid,  setCid]  = useState('');

  const onFileChange = e => setFile(e.target.files[0]);

  const uploadToIPFS = async () => {
    if (!file) return;
    try {
      // pinata.upload.public.file returns an object with .cid
      const { cid } = await pinata.upload.public.file(file);
      setCid(cid);
      console.log('Pinned CID:', cid);
    } catch (err) {
      console.error('Pinata error:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={uploadToIPFS}>Upload to IPFS</button>
      {cid && (
        <p>
          View at:{' '}
          <a
            href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            https://{import.meta.env.VITE_PINATA_GATEWAY}/ipfs/{cid}
          </a>
        </p>
      )}
    </div>
  );
}
