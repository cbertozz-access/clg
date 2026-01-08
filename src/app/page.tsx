async function testBuilderConnection() {
  try {
    // Test connection by fetching models list
    const response = await fetch(
      `https://cdn.builder.io/api/v3/content/page?apiKey=${process.env.NEXT_PUBLIC_BUILDER_API_KEY}&limit=1`
    );
    return {
      connected: response.ok,
      status: response.status,
      apiKey: process.env.NEXT_PUBLIC_BUILDER_API_KEY?.slice(0, 8) + "...",
    };
  } catch (error) {
    return {
      connected: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function Home() {
  const connectionTest = await testBuilderConnection();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          CLG - Composable Lead Generation
        </h1>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Platform Connection Status</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded">
              <span>Builder.io API</span>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  connectionTest.connected
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {connectionTest.connected ? "Connected" : "Failed"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded">
              <span>API Key</span>
              <code className="text-zinc-400 text-sm">
                {connectionTest.apiKey}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded">
              <span>Next.js</span>
              <span className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white">
                Running
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded">
              <span>Vercel</span>
              <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-600 text-white">
                Pending Deploy
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Architecture Ready</h2>
          <ul className="space-y-2 text-zinc-300">
            <li>Next.js 15 with App Router</li>
            <li>TypeScript + Tailwind CSS</li>
            <li>Builder.io SDK installed</li>
            <li>Environment configured</li>
          </ul>
        </div>

        <p className="mt-8 text-zinc-500 text-sm">
          Awaiting design approval before creating Builder.io content.
        </p>
      </div>
    </div>
  );
}
