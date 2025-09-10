import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../styles/CarouselSlider.css";

export default function CarouselSlider({ images, autoPlay = true, interval = 3000 }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="carousel-slider">
      <Carousel
        showThumbs={false}
        autoPlay={autoPlay}
        interval={interval}
        infiniteLoop
        showStatus={false}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="custom-arrow custom-prev"
            >
              ❮
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="custom-arrow custom-next"
            >
              ❯
            </button>
          )
        }
      >
        {images.map((item, index) => (
          <div className="slide" key={index}>
            <img src={item.url} alt={item.alt || `slide-${index}`} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
