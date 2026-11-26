export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div id="desktop-bg">
      <div id="app-shell">{children}</div>
    </div>
  );
}
