"use client";

import { useState } from "react";
import { Facebook, Twitter, Link2, Share2 } from "lucide-react";

interface ShareBarProps {
  url: string;
  title: string;
}

export default function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section>
      <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
        <Share2 size={14} />
        Share
      </h4>
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full border border-border hover:bg-bg transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook size={18} className="text-[#1877F2]" />
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full border border-border hover:bg-bg transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter size={18} className="text-text-primary" />
        </a>

        {/* Pinterest */}
        <a
          href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full border border-border hover:bg-bg transition-colors"
          aria-label="Share on Pinterest"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E60023"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12a4 4 0 1 1 8 0c0 4-2 6-2 6" />
            <path d="M12 2a10 10 0 1 0 4 19.2" />
            <path d="m10 16-1.5 4.5" />
          </svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="p-2.5 rounded-full border border-border hover:bg-bg transition-colors relative"
          aria-label="Copy link"
        >
          <Link2 size={18} className="text-text-secondary" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </section>
  );
}
