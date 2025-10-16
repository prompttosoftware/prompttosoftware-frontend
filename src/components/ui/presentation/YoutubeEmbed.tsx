import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

// This component uses a common CSS trick to maintain the video's 16:9 aspect ratio
// while being fully responsive.
const YouTubeEmbed = ({ videoId, title = 'YouTube video player' }: YouTubeEmbedProps) => {
  return (
    <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
