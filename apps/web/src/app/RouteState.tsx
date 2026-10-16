import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Spinner } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';

type RouteStateProps = {
  state: 'loading' | 'empty' | 'unavailable' | 'error';
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function RouteState({ state, title, description, onRetry }: RouteStateProps) {
  const t = useTranslation();

  if (state === 'loading') {
    const label = title ?? t('loadingPage');
    return (
      <section aria-busy="true" aria-label={label} className="route-state route-state--loading">
        <Spinner label={label} />
        <Skeleton className="route-state__skeleton" />
        <Skeleton className="route-state__skeleton route-state__skeleton--short" />
      </section>
    );
  }

  if (state === 'empty') {
    return <EmptyState title={title ?? t('emptyStateTitle')}>{description ?? t('emptyStateDescription')}</EmptyState>;
  }

  if (state === 'error') {
    return (
      <ErrorState
        title={title ?? t('errorStateTitle')}
        action={onRetry ? <Button onClick={onRetry}>{t('retry')}</Button> : undefined}
      >
        {description ?? t('errorStateDescription')}
      </ErrorState>
    );
  }

  return (
    <Card className="route-state route-state--unavailable" role="status">
      <Badge tone="warning">{t('unavailableBadge')}</Badge>
      <h2>{title ?? t('unavailableStateTitle')}</h2>
      <p>{description ?? t('unavailableStateDescription')}</p>
    </Card>
  );
}
