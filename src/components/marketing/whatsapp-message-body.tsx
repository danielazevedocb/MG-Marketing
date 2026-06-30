import { Fragment } from "react";

type WhatsAppSegment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "strike"; value: string }
  | { type: "link"; value: string };

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const TOKEN_PATTERN = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;

function parseInlineSegments(line: string): WhatsAppSegment[] {
  const segments: WhatsAppSegment[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push(...splitLinks(line.slice(lastIndex, index)));
    }

    const token = match[0];
    if (token.startsWith("*") && token.endsWith("*")) {
      segments.push({ type: "bold", value: token.slice(1, -1) });
    } else if (token.startsWith("_") && token.endsWith("_")) {
      segments.push({ type: "italic", value: token.slice(1, -1) });
    } else if (token.startsWith("~") && token.endsWith("~")) {
      segments.push({ type: "strike", value: token.slice(1, -1) });
    } else {
      segments.push({ type: "text", value: token });
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < line.length) {
    segments.push(...splitLinks(line.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : splitLinks(line);
}

function splitLinks(value: string): WhatsAppSegment[] {
  const segments: WhatsAppSegment[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: value.slice(lastIndex, index) });
    }
    segments.push({ type: "link", value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    segments.push({ type: "text", value: value.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value }];
}

function renderSegment(segment: WhatsAppSegment, key: string) {
  switch (segment.type) {
    case "bold":
      return (
        <strong key={key} className="font-semibold">
          {segment.value}
        </strong>
      );
    case "italic":
      return (
        <em key={key} className="italic">
          {segment.value}
        </em>
      );
    case "strike":
      return (
        <span key={key} className="line-through">
          {segment.value}
        </span>
      );
    case "link":
      return (
        <a
          key={key}
          href={segment.value}
          className="text-[#039be5] underline"
          target="_blank"
          rel="noreferrer noopener"
        >
          {segment.value}
        </a>
      );
    default:
      return <Fragment key={key}>{segment.value}</Fragment>;
  }
}

type WhatsAppMessageBodyProps = {
  message: string;
  className?: string;
};

export function WhatsAppMessageBody({
  message,
  className,
}: WhatsAppMessageBodyProps) {
  const lines = message.split("\n");

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const segments = parseInlineSegments(line);
        return (
          <p
            key={`${lineIndex}-${line}`}
            className={lineIndex > 0 ? "mt-1" : undefined}
          >
            {segments.map((segment, segmentIndex) =>
              renderSegment(segment, `${lineIndex}-${segmentIndex}`),
            )}
            {line === "" ? "\u00A0" : null}
          </p>
        );
      })}
    </div>
  );
}
