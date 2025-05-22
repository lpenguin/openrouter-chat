import React from 'react';
import CopyButton from './CopyButton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="relative overflow-visible z-20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-theme-secondary font-mono opacity-70">{language}</span>
        <CopyButton value={code} />
      </div>
      <div className="relative overflow-visible">
        <SyntaxHighlighter
          PreTag="div"
          language={language}
          style={theme}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
