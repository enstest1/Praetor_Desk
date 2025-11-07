import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { researchContext7Exa, type ResearchResult } from "../api/research";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardTitle, CardDescription, CardSection } from "../components/ui/Card";

function BrainstormTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleResearch = async () => {
    if (!query.trim()) {
      alert("Enter a research query");
      return;
    }

    setLoading(true);
    try {
      const researchResults = await researchContext7Exa({
        query: query.trim(),
        context7_url: "http://localhost:7080",
        exa_url: "http://localhost:7081",
      });
      setResults(researchResults);
    } catch (error) {
      console.error("Failed to research:", error);
      alert("Failed to fetch research. Make sure Context7 and Exa MCP servers are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brainstorm"
        action={{
          label: loading ? "Fetching..." : "Fetch Latest Docs",
          onClick: handleResearch,
          icon: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />,
        }}
      />

      <Card className="space-y-4">
        <div>
          <CardTitle>Research Query</CardTitle>
          <CardDescription>
            Search Context7 docs first, then expand to Exa for recent references.
          </CardDescription>
        </div>
        <CardSection>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to learn?"
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Tip: keep it focused. Try "How to handle OAuth2 PKCE flow in Tauri".
          </div>
        </CardSection>
      </Card>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, idx) => (
            <Card key={idx} className="space-y-3">
              <div>
                <CardTitle>Source: {result.source}</CardTitle>
                {result.metadata && (
                  <CardDescription className="mt-1 text-xs text-slate-500">
                    {JSON.stringify(result.metadata, null, 2)}
                  </CardDescription>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm text-slate-100">
                <pre className="whitespace-pre-wrap break-words text-slate-200">
                  {result.content}
                </pre>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !loading && (
          <Card className="text-center text-sm text-slate-400">
            Enter a query and click "Fetch Latest Docs" to search Context7 and Exa.
          </Card>
        )
      )}
    </div>
  );
}

export default BrainstormTab;
