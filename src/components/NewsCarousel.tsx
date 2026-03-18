import { useState, useEffect, useCallback } from "react";
import { useConfig } from "../config/serverConfig";
import "./NewsCarousel.css";

/**
 * News Carousel — WHITE-LABEL CUSTOMIZABLE component.
 * Reads news items from server.config.json and displays them in a rotating hero banner.
 */
function NewsCarousel() {
  const config = useConfig();
  const { news } = config.server;
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (news.length > 0) {
      setActiveIndex((prev) => (prev + 1) % news.length);
    }
  }, [news.length]);

  // Auto-rotate slides every 6 seconds
  useEffect(() => {
    if (news.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [news.length, nextSlide]);

  if (news.length === 0) {
    return (
      <div className="news-carousel glass-card">
        <div className="news-empty">
          <span className="news-empty-text">No news available</span>
        </div>
      </div>
    );
  }

  const currentNews = news[activeIndex];

  return (
    <div className="news-carousel glass-card">
      {/* Banner content */}
      <div className="news-slide">
        {/* Gradient overlay for text readability */}
        <div className="news-gradient" />

        {/* Background image (if provided) */}
        {currentNews.image && (
          <img src={currentNews.image} alt="" className="news-bg-image" />
        )}

        {/* Default pattern background when no image */}
        {!currentNews.image && <div className="news-pattern-bg" />}

        {/* Content overlay */}
        <div className="news-content">
          <span className="news-date">{currentNews.date}</span>
          <h2 className="news-title">{currentNews.title}</h2>
          <p className="news-description selectable">{currentNews.description}</p>
        </div>
      </div>

      {/* Navigation dots */}
      {news.length > 1 && (
        <div className="news-dots">
          {news.map((_, index) => (
            <button
              key={news[index].id}
              className={`news-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to news ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsCarousel;
