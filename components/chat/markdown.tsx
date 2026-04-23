'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-4 last:mb-0 leading-relaxed text-foreground/90">
            {children}
          </p>
        ),
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground/90">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="marker:text-primary/60">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic text-muted-foreground bg-muted/30 rounded-r-sm">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-t border-border/60" />,
        table: ({ children }) => (
          <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-2 text-foreground/80">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        a: ({ ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium transition-colors"
          />
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm text-foreground/90 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeBlock
              language={match[1]}
              value={String(children).replace(/\n$/, '')}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-border bg-[#1e1e1e] group transition-all duration-200">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-border/50">
        <span className="text-xs font-mono text-[#cccccc] uppercase tracking-wider">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#cccccc] hover:text-white hover:bg-white/10 transition-colors"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            fontFamily: 'var(--font-mono)',
          }}
          codeTagProps={{
            style: {
              background: 'transparent',
              padding: 0,
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
