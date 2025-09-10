import React from "react";
import OfferStrip from "../components/OfferStrip";
import CategorySection from "../components/CategorySection";
import CarouselSlider from "../components/CarouselSlider";
import "../styles/Home.css";

// === Image Arrays for All Sliders ===

// 1️⃣ Hero Carousel
const heroImages = [
  { url: "https://assets.ajio.com/cms/AJIO/WEB/Top-D-Fashionation-5090-1440x470.gif" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-MainBanner-P3-WesternwearBrands-DenislingoMissChase-Min60ExtraUpto35.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-MainBanner-P4-Trends-Flat70.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-MainBanner-P6-Handbags-CapreseLinoPerros-Upto70.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-MainBanner-P7-Winterwear-LeeWrnagler-Min50.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-MainBanner-P2-WinterwearWardrobe-USPAFortCollins-Min50.jpg" },
];

// 2️⃣ Coupon Section Slider
const couponImages = [
  { url: "https://assets.ajio.com/cms/AJIO/WEB/1440x128--FB.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/Paytm-1440x128pppp.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/HSBC-1440x128.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-offers-payupto3AJIOpoints.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-offers-payupto3AJIOpoints.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-offers-relianceone.jpg" },
];
// 3️⃣ Top Banner Slider
const topBannerImages = [
   { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-26Hrs-D-P1-Ketch-Flat65.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-26Hrs-D-P1-Ketch-Flat65.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-TopBanner-P4-ONLYVeroModa-Min60.jpg" },
];

// 4️⃣ Daily Banner Slider
const dailyBannerImages = [
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-DailyBanner-P1-Bedsheets-HomeSparrowUniqChoice-Starting399.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-DailyBanner-P2-Sportswear-SkechersFila-Min50.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-DailyBanner-P3-EssentialsForHim-DNMXNetplay-Starting199.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-DailyBanner-P4-MnS-Upto40Extra35.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-DailyBanner-P5-InnerwearLoungewear-ZivameClovia-Upto75.jpg" },
];

// 6️⃣ Rewards Section Slider
const rewardsImages = [
{ url: "https://assets.ajio.com/medias/sys_master/images/images/h77/h2a/47159513612318/04022022-D-unisex-ajiomania-bankoffers-jiomartmaha.jpg" },
  { url: "https://assets.ajio.com/medias/sys_master/images/images/h06/h64/47159513546782/04022022-D-unisex-ajiomania-bankoffers-relianceone.jpg" },
];

// 7️⃣ Sponsor Brands Slider
const sponsorImages = [
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-UHPwomen-p1-uniqchoice-homezsparrow-starting399.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-UHPwomen-p1-nike-fila-40to50.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-UHPwomen-p3-satyapaul-scotch&soda-30to50.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-UHPwomen-p4-dnmx-trendyol-starting699.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/17012023-UHP-D-UHPwomen-p5-zivame-clovia-starting199.jpg" },
];

// 8️⃣ Additional Promo Slider
const promoImages = [
 { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-trendscarousel-upto70.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/D-UHP-trendscarousel-winterwear-edited.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-trendscarousel-azorte.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-trendscarousel-bestsellers.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/D-UHP-trendscarousel-womensethnic-edited.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-trendscarousel-womenswestern.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/060123-D-UHP-trendscarousel-kidswear.jpg" },
  { url: "https://assets.ajio.com/cms/AJIO/WEB/D-UHP-trendscarousel-footwear-edited.jpg" },
];

export default function HomePage() {
  return (
    <div className="homepage">

       {/* 1️⃣ Hero Carousel */}
      <section className="slider-section">
        <CarouselSlider images={heroImages} interval={4000} />
      </section>

      {/* Offer Strip */}
      <OfferStrip />

      {/* New User Perks */}
      <section className="perks">
        <h3>New User Perks, Unlocked</h3>
        <p>Special discounts for first-time shoppers!</p>
      </section>

      {/* Category Section */}
      <CategorySection />

      {/* 2️⃣ Coupon Section */}
      <section className="slider-section">
        <h2 className="slider-header">Coupons & Offers</h2>
        <CarouselSlider images={couponImages} interval={3500} />
      </section>

      {/* 3️⃣ Top Banner Slider */}
      <section className="slider-section">
        <h2 className="slider-header">Top Brands</h2>
        <CarouselSlider images={topBannerImages} interval={3000} />
      </section>


       <div id="beauty_packs">
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h33/h97/47143960936478/04022022-D-unisex-ajiomania-beauty-strip.jpg"
        alt=""/>
    </div>

       {/* 4️⃣ Daily Banner Slider */}
      <section className="slider-section">
        <h2 className="slider-header">Daily Deals</h2>
        <CarouselSlider images={dailyBannerImages} interval={3000} />
      </section>



       <div id="best_of_internantional_images">
        <h2 className="slider-header">TOP BRANDS</h2>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h7e/hf4/47135238291486/04022022-D-unisex-ajiomania-internationalbrands-gas-min30.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h8c/h0f/47135238422558/04022022-D-unisex-ajiomania-internationalbrands-stevemadden-min30.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h91/h41/47135238488094/04022022-D-unisex-ajiomania-internationalbrands-clarks-3050.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h7a/h84/47135238553630/04022022-D-unisex-ajiomania-internationalbrands-koton-3060.jpg"
        alt=""/>
    </div>

    {/* 6️⃣ Rewards Section */}
      <section className="slider-section">
        <h2 className="slider-header">Rewards & Cashback</h2>
        <CarouselSlider images={rewardsImages} interval={3000} />
      </section>

      {/* 7️⃣ Sponsor Brands */}
      <section className="slider-section">
        <h2 className="slider-header">Sponsor Brands</h2>
        <CarouselSlider images={sponsorImages} interval={3000} />
      </section>

      {/* 8️⃣ Additional Promo Slider */}
      <section className="slider-section">
        <h2 className="slider-header">Promotions & Trends</h2>
        <CarouselSlider images={promoImages} interval={3000} />
      </section>
  
<div id="new_deals_img">
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h73/hdb/47143964147742/04022022-D-unisex-ajiomania-explorebrands-biba-4060.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/hbc/h49/47143964278814/04022022-D-unisex-ajiomania-explorebrands-fortcollins-4070.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h6a/he2/47143964344350/04022022-D-unisex-ajiomania-explorebrands-damilano-upto30.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h8a/h53/47143964409886/04022022-D-unisex-ajiomania-explorebrands-unlimited-upto50.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/hdd/h8b/47143964475422/04022022-D-unisex-ajiomania-explorebrands-bullmer-min50.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/hcc/h0f/47143964540958/04022022-D-unisex-ajiomania-explorebrands-highstar-5070.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h68/h11/47143964606494/04022022-D-unisex-ajiomania-explorebrands-gulmohar-min60.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/hf2/h16/47143964803102/04022022-D-unisex-ajiomania-explorebrands-dennislingo-min60.jpg"
        alt=""/>
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h21/h37/47143964999710/04022022-D-unisex-ajiomania-explorebrands-dillinger-min60.jpg"
        alt=""/>
    </div>

    <div id="ajio_cares">
      <img
        src="https://assets.ajio.com/medias/sys_master/images/images/h39/h73/33294823522334/13102020-D-unisex-ajiocares-strip.jpg"
        alt=""/>
    </div>

  </div>
  );
}