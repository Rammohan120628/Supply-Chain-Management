// DashboardCards.jsx
import CardBox from 'src/components/shared/CardBox';
import Backgrond from '/src/assets/images/backgrounds/make-social-media.png';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import { Icon } from "@iconify/react";

const DashboardCards = () => {
  const SmallCard = [
    {
      icon: "solar:pie-chart-2-broken",
      num: "2358",
      percent: "+23%",
      title: "Sales",
      shape: shape1,
      bgcolor: "error",
      desc: "Total sales count",
    },
    {
      icon: "solar:refresh-circle-line-duotone",
      num: "434",
      percent: "-12%",
      title: "Refunds",
      shape: shape2,
      bgcolor: "secondary",
      desc: "Refund requests",
    },
    {
      icon: "solar:dollar-minimalistic-linear",
      num: "$245k",
      percent: "+8%",
      title: "Earnings",
      shape: shape3,
      bgcolor: "success",
      desc: "Total earnings",
    },
    {
      icon: "solar:box-linear",
      num: "1,258",
      percent: "+15%",
      title: "Stock Items",
      shape: shape1,
      bgcolor: "info",
      desc: "Active inventory",
    },
    {
      icon: "solar:truck-delivery-linear",
      num: "892",
      percent: "+5%",
      title: "Deliveries",
      shape: shape2,
      bgcolor: "warning",
      desc: "Monthly deliveries",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
      {/* Welcome Card - Takes 2 columns */}
      <div className="lg:col-span-2">
        <CardBox className='bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 relative overflow-hidden'>
          <div className='relative z-10'>
            <h4 className='text-white text-xl font-bold'>Welcome Jonathan Deo</h4>
            <p className='text-sm text-white/90 font-medium mt-1'>Check all the stock statistics</p> 
            <div className='flex align-center rounded-xl justify-between bg-white/10 backdrop-blur-sm w-fit mt-6 p-2'>
              <div className='py-3 px-6 text-center'>
                <h5 className='text-white text-2xl font-bold leading-[normal]'>573</h5>
                <small className='text-white/80 text-xs font-medium block'>New Leads</small>   
              </div>
              <div className='py-3 px-6 text-center border-s border-white/20'>
                <h5 className='text-white text-2xl font-bold leading-[normal]'>87%</h5>
                <small className='text-white/80 text-xs font-medium block'>Conversion</small> 
              </div>
            </div>    
          </div>
          <img
            src={Backgrond}
            alt="background"
            className="absolute end-0 -top-7 sm:block hidden rtl:scale-x-[-1] opacity-80"
          />
        </CardBox>
      </div>
      
      {/* Small Cards - Take remaining 4 columns */}
      {SmallCard.map((theme, index) => (
        <div className="lg:col-span-1" key={index}>
          <CardBox
            className={`relative shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-${theme.bgcolor}-500 to-${theme.bgcolor}-600 shadow-lg`}
                >
                  <Icon icon={theme.icon} height={24} />
                </span>
                <span className={`font-semibold text-xs py-1 px-3 rounded-full bg-${theme.bgcolor}-100 text-${theme.bgcolor}-600 dark:bg-${theme.bgcolor}-900/30 dark:text-${theme.bgcolor}-300`}>
                  {theme.percent}
                </span>
              </div>
              
              {/* Stats */}
              <div>
                <h5 className="text-2xl font-bold text-gray-800 dark:text-white">{theme.num}</h5>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mt-1">{theme.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">{theme.desc}</p>
              </div>
            </div>
            
            {/* Background Shape */}
            <img
              src={theme.shape}
              alt="shape"
              className="absolute end-0 top-0 opacity-10 dark:opacity-5"
            />
          </CardBox>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;