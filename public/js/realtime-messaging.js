(function () {
  const cfg = window.__JCBO_REALTIME__;
  if (!cfg?.url || !cfg?.anonKey) return;

  import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) => {
    const client = createClient(cfg.url, cfg.anonKey);

    const changeFilter = cfg.conversationId
      ? { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${cfg.conversationId}` }
      : { event: "INSERT", schema: "public", table: "messages" };

    const channel = client
      .channel(`messages-${cfg.conversationId ?? "all"}`)
      .on("postgres_changes", changeFilter, (payload) => {
        const row = payload.new;
        if (!row) return;

        const message = {
          conversation_id: row.conversation_id,
          de: row.de,
          texte: row.texte,
          heure: row.heure,
        };

        if (typeof cfg.onMessage === "function") {
          cfg.onMessage(message);
        } else {
          window.dispatchEvent(
            new CustomEvent("jcbo:new-message", { detail: message })
          );
        }
      });

    if (!cfg.conversationId) {
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          window.dispatchEvent(
            new CustomEvent("jcbo:conversation-update", { detail: row })
          );
        }
      );
    }

    channel.subscribe();
    window.__jcboRealtimeChannel = channel;
  });
})();
