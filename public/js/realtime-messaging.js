(function () {
  const cfg = window.__JCBO_REALTIME__;
  if (!cfg?.url || !cfg?.anonKey) return;

  import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) => {
    const client = createClient(cfg.url, cfg.anonKey);
    const channel = client
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          if (typeof cfg.onMessage === "function") cfg.onMessage();
          else window.dispatchEvent(new CustomEvent("jcbo:new-message"));
        }
      )
      .subscribe();
    window.__jcboRealtimeChannel = channel;
  });
})();
