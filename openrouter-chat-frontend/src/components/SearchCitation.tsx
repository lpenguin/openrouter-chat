import React from 'react';

export interface SearchCitationProps {
  url: string;
  faviconUrl?: string;
  citation?: string;
  title?: string;
  content?: string;
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const SearchCitation: React.FC<SearchCitationProps> = ({ url, faviconUrl, citation, title, content }) => (
  <div className="flex items-start gap-2 border border-theme rounded p-2 bg-theme-background mb-2">
    {faviconUrl && (
      <img src={faviconUrl} alt="favicon" className="w-5 h-5 mt-1" />
    )}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-theme-primary truncate">
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {title || citation || getDomain(url)}
        </a>
      </div>
      {content && <div className="text-xs text-theme-secondary mt-1 line-clamp-2">{content}</div>}
      <div className="text-xs text-theme-secondary mt-1">{getDomain(url)}</div>
    </div>
  </div>
);

export default SearchCitation;
