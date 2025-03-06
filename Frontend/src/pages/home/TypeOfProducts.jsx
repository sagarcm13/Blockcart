import { Link } from 'react-router-dom';

export default function TypeOfProducts() {
    const items = [
        {
            id: 1,
            type: "laptop",
            desc: "Laptop",
            imgurl: "https://img5.gadgetsnow.com/gd/images/products/additional/large/G454183_View_1/computer-laptop/laptops/asus-vivobook-15-x1502za-ej541ws-intel-core-i5-12500h-15-6-inches-notebook-laptop-16gb-512gb-ssd-windows-11-quiet-blue-1-7-kg-.jpg",
        },
        {
            id: 2,
            type: "phone",
            desc: "Phone",
            imgurl: "https://images.jdmagicbox.com/quickquotes/images_main/realme-gt-neo-2-ram-12-gb-256-gb-neo-blue-241073706-e39lh.png",
        },
        {
            id: 3,
            type: "tv",
            desc: "Television",
            imgurl: "https://aws-obg-image-lb-3.tcl.com/content/dam/brandsite/product/tv/p/p615/pc/product/EM_55P615_left_global.png",
        }
    ]

    return (
        <>
            <div className='flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:mt-10 md:space-x-40 top-[350px] left-[30%] md:left-[25%]'>
                {
                    items.map((item) => (
                        <div key={item.id} className='border-white border-2 p-4 w-[150px] md:w-[200px] h-[250px] flex flex-col items-center justify-between'>
                            <Link to="/list" state={{ type: item.type }}>
                                <img
                                    src={item.imgurl}
                                    className='w-full h-[150px] object-cover rounded-[25%] flex-shrink-0'
                                    alt={item.desc}
                                />
                            </Link>
                            <div className="md:text-2xl text-white text-center mt-2">{item.desc}</div>
                        </div>
                    ))
                }
            </div>
        </>
    );
}
