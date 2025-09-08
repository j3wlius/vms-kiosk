import React from 'react';
import { useAtomValue } from 'jotai';
import { networkStatusAtom, syncStatusAtom } from '../../stores/atoms/systemAtoms';
import StatusIndicator from './StatusIndicator';

const OfflineIndicator = ({ className = '' }) => {
  const networkStatus = useAtomValue(networkStatusAtom);
  const syncStatus = useAtomValue(syncStatusAtom);

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return {
        status: 'warning',
        message: 'You are offline. Data will be saved locally and synced when connection is restored.'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          status: 'loading',
          message: 'Syncing data with server...'
        };
      case 'synced':
        return {
          status: 'success',
          message: 'All data synced successfully'
        };
      case 'sync_failed':
        return {
          status: 'error',
          message: 'Sync failed. Data saved locally. Will retry automatically.'
        };
      case 'partial_sync':
        return {
          status: 'warning',
          message: 'Some data synced. Retrying failed items...'
        };
      default:
        return {
          status: 'info',
          message: 'Connected and ready'
        };
    }
  };

  const statusConfig = getStatusMessage();

  // Don't show if everything is working normally
  if (networkStatus.isOnline && syncStatus === 'synced') {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <StatusIndicator
        status={statusConfig.status}
        message={statusConfig.message}
        className="shadow-lg"
      />
    </div>
  );
};

export default OfflineIndicator;
