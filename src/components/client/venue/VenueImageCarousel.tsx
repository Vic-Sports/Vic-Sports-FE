import React from "react";
import { Carousel } from "antd";
import ReactDOM from "react-dom";

interface VenueImageCarouselProps {
  images: string[];
  alt?: string;
}

const defaultImage =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop&crop=center&auto=format&q=80";

const VenueImageCarousel: React.FC<VenueImageCarouselProps> = ({
  images,
  alt,
}) => {
  const imageList = images && images.length > 0 ? images : [defaultImage];
  const [current, setCurrent] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);

  return (
    <div style={{ width: "100%" }}>
      <Carousel
        dots={false}
        autoplay
        style={{ borderRadius: 20, overflow: "hidden" }}
        beforeChange={(_, next) => setCurrent(next)}
      >
        {imageList.map((img, idx) => (
          <div key={idx}>
            <img
              src={img}
              alt={alt || `Venue Image ${idx + 1}`}
              style={{
                width: "100%",
                height: 250,
                objectFit: "cover",
                borderRadius: 20,
                cursor: "zoom-in",
              }}
              onClick={() => setZoomOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
          </div>
        ))}
      </Carousel>
      {/* Preview thumbnails */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 12,
        }}
      >
        {imageList.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={alt || `Preview ${idx + 1}`}
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 8,
              border: current === idx ? "2px solid #1890ff" : "2px solid #eee",
              cursor: "pointer",
              boxShadow: current === idx ? "0 0 6px #1890ff" : "none",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
            onClick={() => setCurrent(idx)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
        ))}
      </div>
      {/* Zoom modal - render portal to body */}
      {zoomOpen &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.85)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
            }}
            onClick={() => setZoomOpen(false)}
          >
            <img
              src={imageList[current]}
              alt={alt || `Venue Image Zoom`}
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: 20,
                boxShadow: "0 0 24px #000",
                background: "#222",
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default VenueImageCarousel;
