export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header" />
      <div className="skeleton-line w80" />
      <div className="skeleton-line w60" />
      <div className="skeleton-line w40" />
      <div className="skeleton-footer">
        <div className="skeleton-btn" />
        <div className="skeleton-btn short" />
      </div>
    </div>
  );
}
