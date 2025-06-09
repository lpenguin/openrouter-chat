import React, { useState } from 'react';
import CopyButton from './CopyButton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const isSvg = language.toLowerCase() === 'svg' || language.toLowerCase() === 'xml';
  const [showPreview, setShowPreview] = useState(isSvg); // Default to preview for SVG

  const renderSvgPreview = () => {
    try {
      return (
        <div className="bg-white border border-gray-200 rounded p-4 flex items-center justify-center min-h-[100px]">
          <div 
            className="w-full max-w-full overflow-hidden flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: code }} 
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600 text-sm">
          Error rendering SVG: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      );
    }
  };

  return (
    <div className="relative overflow-visible z-20">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-secondary font-mono opacity-70">{language}</span>
          {isSvg && (
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setShowPreview(true)}
                className={`px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                  showPreview 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <EyeIcon className="w-3 h-3" />
                Preview
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                  !showPreview 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CodeBracketIcon className="w-3 h-3" />
                Code
              </button>
            </div>
          )}
        </div>
        <CopyButton value={code} />
      </div>
      <div className="relative overflow-visible">
        {isSvg && showPreview ? (
          <div className="overflow-x-auto">
            {renderSvgPreview()}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              PreTag="div"
              language={language}
              style={theme}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
