import React from 'react';
import { useAtomValue } from 'jotai';
import { networkStatusAtom, syncStatusAtom, syncProgressAtom } from '../../stores/atoms/systemAtoms';
import StatusIndicator from './StatusIndicator';

const SyncStatus = ({ className = '' }) => {
  const networkStatus = useAtomValue(networkStatusAtom);
  const syncStatus = useAtomValue(syncStatusAtom);
  const syncProgress = useAtomValue(syncProgressAtom);

  const getStatusConfig = () => {
    if (!networkStatus.isOnline) {
      return {
        status: 'warning',
        message: 'Offline - Data will be saved locally',
        showProgress: false
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          status: 'loading',
          message: 'Syncing data with server...',
          showProgress: true
        };
      case 'synced':
        return {
          status: 'success',
          message: 'All data synced successfully',
          showProgress: false
        };
      case 'sync_failed':
        return {
          status: 'error',
          message: 'Sync failed - Will retry automatically',
          showProgress: false
        };
      case 'partial_sync':
        return {
          status: 'warning',
          message: 'Partial sync - Some data pending',
          showProgress: false
        };
      case 'offline':
        return {
          status: 'info',
          message: 'Working offline - Data queued for sync',
          showProgress: false
        };
      default:
        return {
          status: 'info',
          message: 'Connected and ready',
          showProgress: false
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`${className}`}>
      <StatusIndicator
        status={statusConfig.status}
        message={statusConfig.message}
        className="mb-2"
      />
      
    </div>
  );
};

export default SyncStatus;
