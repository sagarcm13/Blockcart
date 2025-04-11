// eslint-disable-next-line react/prop-types
export default function GetUploadedFiles({ fileCID }) {
    return (
        <>
            <p>
                View at:{' '}
                <a
                    href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${fileCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    https://{import.meta.env.VITE_PINATA_GATEWAY}/ipfs/{fileCID}
                </a>
            </p>
       </>
    )
}
