import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Spinner } from '../shared/components/primitives';
import type { MessageKey } from '../shared/i18n/messages';
import { useTranslation } from '../shared/i18n/useTranslation';

type RouteStateProps = {
  state: 'loading' | 'empty' | 'unavailable' | 'error';
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export type OperationFailureKind =
  | 'permission-denied'
  | 'unsupported'
  | 'interrupted'
  | 'malformed-input'
  | 'cloud-save-unconfirmed';

const operationFailureMessages: Record<OperationFailureKind, readonly [MessageKey, MessageKey]> = {
  'permission-denied': ['permissionFailureTitle', 'permissionFailureDescription'],
  unsupported: ['unsupportedFailureTitle', 'unsupportedFailureDescription'],
  interrupted: ['interruptedFailureTitle', 'interruptedFailureDescription'],
  'malformed-input': ['invalidInputFailureTitle', 'invalidInputFailureDescription'],
  'cloud-save-unconfirmed': ['cloudSaveFailureTitle', 'cloudSaveFailureDescription'],
};

/** Presentational failure mapping for feature services; it performs no operation or retry itself. */
export function OperationFailureNotice({ kind }: { kind: OperationFailureKind }) {
  const t = useTranslation();
  const [titleKey, descriptionKey] = operationFailureMessages[kind];
  return <ErrorState title={t(titleKey)}>{t(descriptionKey)}</ErrorState>;
}

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
