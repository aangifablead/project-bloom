import React, { useEffect, useState } from 'react';

interface RepoActivityProps {
  owner: string;
  repo: string;
}

export const RepoActivity: React.FC<RepoActivityProps> = ({ owner, repo }) => {
  const [data, setData] = useState<{ commits: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/git/${owner}/${repo}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not fetch repository data');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [owner, repo]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading activity...</div>;
  if (error) return <div className="p-4 text-sm text-destructive">Error: {error}</div>;
  if (!data?.commits?.length) return <div className="p-4 text-sm">No recent activity found.</div>;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-lg">Recent Commits</h4>
      <div className="border rounded-lg divide-y">
        {data.commits.map((c: any) => (
          <div key={c.sha} className="p-3 hover:bg-muted/50 transition-colors">
            <p className="text-sm font-medium truncate">{c.commit.message}</p>
            <p className="text-xs text-muted-foreground">
              {c.commit.author.name} • {new Date(c.commit.author.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};