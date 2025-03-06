import Slider from 'react-slick';

export default function SliderComponent() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    const images = [
        {
            id: 1,
            url: 'https://rukminim2.flixcart.com/fk-p-flap/850/400/image/e3426ff7b0c4c350.jpg?q=20',
            alt: 'Laptop for Sale',
        },
        {
            id: 2,
            url: 'https://images.indianexpress.com/2024/03/Infinix-Smart-8-Plus-Sale.jpg',
            alt: 'Smartphone Deal',
        },
        {
            id: 3,
            url: 'https://aws-obg-image-lb-1.tcl.com/content/dam/iffalcon/news/pc/card-image/iFFALCON_FK_PR_1200x600.jpg',
            alt: 'Television Promotion',
        }
    ];

    return (
        <div className="w-full overflow-hidden">
            <Slider {...settings}>
                {images.map((image) => (
                    <div key={image.id} className="w-full flex justify-center items-center h-[78vh]"> 
                        <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
}