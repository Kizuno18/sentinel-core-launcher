import "./TwitchStreams.css";

/** Placeholder stream data with OTServ-realistic channel names */
const PLACEHOLDER_STREAMS = [
  { channel: "ExordionTV", game: "Exordion", viewers: "3.2K", live: true },
  { channel: "OTServ_Brasil", game: "MasterCores", viewers: "1.8K", live: true },
  { channel: "BravoraPVP", game: "Exordion", viewers: "945", live: true },
  { channel: "HuntMaster_OT", game: "DeusOT", viewers: "721", live: true },
];

/**
 * Twitch Streams panel — shows stream thumbnails.
 * Currently under development with placeholder data.
 * Will be integrated with Twitch API for real-time stream data.
 */
function TwitchStreams() {
  return (
    <div className="twitch-streams">
      <div className="twitch-header">
        <div className="twitch-header-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9146ff">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
          </svg>
          <h3 className="twitch-title">Live Streams</h3>
        </div>
        <span className="twitch-dev-badge">UNDER DEVELOPMENT</span>
      </div>

      <div className="twitch-grid">
        {PLACEHOLDER_STREAMS.map((stream) => (
          <div key={stream.channel} className="twitch-card glass-card">
            {/* Placeholder thumbnail with gradient */}
            <div className="twitch-thumbnail">
              <div className="twitch-thumbnail-pattern" />
              <div className="twitch-dev-overlay">
                <span>🔒 Coming Soon</span>
              </div>
              {stream.live && <span className="twitch-live-badge">LIVE</span>}
            </div>

            <div className="twitch-info">
              <span className="twitch-channel">{stream.channel}</span>
              <div className="twitch-meta">
                <span className="twitch-game">{stream.game}</span>
                <span className="twitch-viewers">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  {stream.viewers}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TwitchStreams;
