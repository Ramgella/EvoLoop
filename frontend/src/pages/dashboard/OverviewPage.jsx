import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

function isProfileComplete(profile) {
  return Boolean(profile?.full_name && profile?.headline && profile?.bio);
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { profile, status } = useProfile();

  const name = profile?.full_name || user?.user_metadata?.full_name || '';
  const firstName = name.split(' ')[0];
  const profileDone = isProfileComplete(profile);

  const steps = [
    {
      id: 'account',
      title: 'Create your account',
      description: 'Your EvoLoop workspace is ready.',
      done: true,
    },
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your name, a professional headline and a short bio.',
      done: profileDone,
      action: { label: profileDone ? 'Edit profile' : 'Complete profile', to: '/dashboard/settings' },
    },
    {
      id: 'projects',
      title: 'Add your first project',
      description: 'Describe something you have built and your role in it.',
      done: false,
      upcoming: true,
    },
    {
      id: 'skills',
      title: 'Record your skills',
      description: 'List the skills you want to track over time.',
      done: false,
      upcoming: true,
    },
    {
      id: 'evidence',
      title: 'Attach evidence',
      description: 'Link proof of your work to the skills it demonstrates.',
      done: false,
      upcoming: true,
    },
  ];
  const completed = steps.filter((step) => step.done).length;

  return (
    <>
      <PageHeader
        title="Professional Overview"
        subtitle={
          firstName
            ? `Welcome, ${firstName}. A summary of your professional identity and how it is evolving.`
            : 'A summary of your professional identity and how it is evolving.'
        }
      />

      <section className="stat-grid" aria-label="Key metrics">
        <StatCard label="Skills" value="0" hint="No skills recorded yet" />
        <StatCard label="Projects" value="0" hint="No projects added yet" />
        <StatCard label="Evidence Coverage" value="0%" hint="Skills backed by evidence" />
      </section>

      <section className="panel" aria-labelledby="getting-started-title">
        <div className="panel-header">
          <div>
            <h2 id="getting-started-title" className="panel-title">
              Getting started
            </h2>
            <p className="panel-subtitle">A few steps to set up your workspace.</p>
          </div>
          <span className="panel-meta">
            {status === 'loading' ? '…' : `${completed} of ${steps.length} complete`}
          </span>
        </div>

        <ol className="checklist">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`checklist-item${step.done ? ' is-done' : ''}${step.upcoming ? ' is-upcoming' : ''}`}
            >
              <span className="checklist-marker" aria-hidden="true">
                {step.done && <Check size={12} strokeWidth={3} />}
              </span>
              <div className="checklist-text">
                <span className="checklist-title">
                  {step.title}
                  <span className="visually-hidden">{step.done ? ' (complete)' : ''}</span>
                </span>
                <span className="checklist-description">{step.description}</span>
              </div>
              {step.action && (
                <Link to={step.action.to} className="btn btn-secondary btn-sm" id={`step-${step.id}-action`}>
                  {step.action.label}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
              {step.upcoming && <span className="tag">Coming soon</span>}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
