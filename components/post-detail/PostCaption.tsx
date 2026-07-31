import Link from "next/link";

interface PostCaptionProps {
  description: string;
  hashtags: string[];
}

export default function PostCaption({
  description,
  hashtags,
}: PostCaptionProps) {
  return (
    <div className="space-y-2">
      <p className="text-[14px] text-neutral-800 leading-relaxed">
        {description}
      </p>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 pt-1">
          {hashtags.map((tag) => (
            <Link
              key={tag}
              href={`/hashtag/${encodeURIComponent(tag)}`}
              className="text-[13px] text-accent hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
