const Loader = () => {
    return (
        <div className="relative w-24 h-24 rounded-full" style={loaderStyles.loader}>
            <div style={{ ...loaderStyles.shared, ...loaderStyles.before }}></div>
            <div style={{ ...loaderStyles.shared, ...loaderStyles.after }}></div>
        </div>
    );
};

const loaderStyles = {
    loader: {
        transform: 'rotateZ(45deg)',
        perspective: '1000px',
        color: '#fff',
    },
    shared: {
        content: "''",
        display: 'block',
        position: 'absolute',
        top: '0',
        left: '0',
        width: 'inherit',
        height: 'inherit',
        borderRadius: '50%',
        transform: 'rotateX(70deg)',
        animation: '1s spin linear infinite',
    },
    before: {
        color: '#fff',
    },
    after: {
        color: '#FF3D00',
        transform: 'rotateY(70deg)',
        animationDelay: '.4s',
    }
};

// Define keyframes using inline styles
const keyframes = `
@keyframes spin {
  0%, 100% {
    box-shadow: .2em 0px 0 0px currentcolor;
  }
  12% {
    box-shadow: .2em .2em 0 0 currentcolor;
  }
  25% {
    box-shadow: 0 .2em 0 0px currentcolor;
  }
  37% {
    box-shadow: -.2em .2em 0 0 currentcolor;
  }
  50% {
    box-shadow: -.2em 0 0 0 currentcolor;
  }
  62% {
    box-shadow: -.2em -.2em 0 0 currentcolor;
  }
  75% {
    box-shadow: 0px -.2em 0 0 currentcolor;
  }
  87% {
    box-shadow: .2em -.2em 0 0 currentcolor;
  }
}`;

const LoaderWithKeyframes = () => (
    <>
        <style>
            {keyframes}
        </style>
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
                <Loader />
                <div className="m-5 text-white">Loading</div>
            </div>
        </div>

    </>
);

export default LoaderWithKeyframes;