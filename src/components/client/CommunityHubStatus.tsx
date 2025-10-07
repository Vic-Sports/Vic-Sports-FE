import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaSync } from "react-icons/fa";

interface CommunityHubStatusProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  children: React.ReactNode;
}

const CommunityHubStatus: React.FC<CommunityHubStatusProps> = ({
  loading,
  error,
  onRetry,
  emptyMessage = "No data available",
  children,
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-danger">
        <FaExclamationTriangle className="mb-2" size={24} />
        <p className="mb-3">Failed to load data: {error}</p>
        {onRetry && (
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={onRetry}
          >
            <FaSync className="me-1" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (React.Children.count(children) === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <FaCheckCircle className="mb-2" size={24} />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default CommunityHubStatus;
