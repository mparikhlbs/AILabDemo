const PageContainer = ({ children, className = '' }) => (
  <main className={`page-container ${className}`.trim()}>{children}</main>
);

export default PageContainer;