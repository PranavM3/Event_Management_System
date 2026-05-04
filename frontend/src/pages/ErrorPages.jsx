import { Link } from 'react-router-dom';
import { ShieldOff, Home, AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="error-page">
      <div className="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary"><Home size={18} /> Go Home</Link>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="error-page">
      <div className="error-icon"><ShieldOff size={64} /></div>
      <div className="error-code">403</div>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/dashboard" className="btn btn-primary"><Home size={18} /> Go Home</Link>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="error-page">
      <div className="error-icon"><AlertTriangle size={64} /></div>
      <div className="error-code">500</div>
      <h1>Server Error</h1>
      <p>Something went wrong on our end. Please try again later.</p>
      <Link to="/dashboard" className="btn btn-primary"><Home size={18} /> Go Home</Link>
    </div>
  );
}
