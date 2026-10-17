import type { ImgHTMLAttributes } from 'react';

export interface ProfileSummaryProps {
  displayName: string;
  profileLabel: string;
  imageUrl?: ImgHTMLAttributes<HTMLImageElement>['src'] | null;
}

/** Presentation-only profile summary. Authentication and profile loading belong to the app service layer. */
export function ProfileSummary({ displayName, profileLabel, imageUrl }: ProfileSummaryProps) {
  return (
    <div aria-label={profileLabel} className="app-sidebar__profile" role="group">
      <div className="app-sidebar__avatar">
        {imageUrl ? (
          <img alt="" className="app-sidebar__avatar-image" src={imageUrl} />
        ) : (
          <svg aria-hidden="true" className="app-sidebar__avatar-placeholder" fill="none" viewBox="0 0 48 48">
            <circle cx="24" cy="17" r="8" />
            <path d="M9 42c1-9 6.8-14 15-14s14 5 15 14" />
          </svg>
        )}
      </div>
      <span className="app-sidebar__profile-name">{displayName}</span>
    </div>
  );
}
