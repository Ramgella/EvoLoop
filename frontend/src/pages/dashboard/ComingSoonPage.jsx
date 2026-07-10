import PageHeader from '../../components/ui/PageHeader';

export default function ComingSoonPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <section className="panel empty-state">
        <span className="tag">Coming soon</span>
        <h2 className="empty-state-title">{title} isn&apos;t available yet</h2>
        <p className="empty-state-text">
          This section is planned for a later release of EvoLoop.
        </p>
      </section>
    </>
  );
}
