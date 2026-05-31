/**
 * Função serverless (Vercel) usada pelo assistente de instalação.
 *
 * Recebe { accessToken, projectRef, query } e executa o SQL no projeto Supabase
 * do cliente via Management API. Roda no servidor (não no navegador) para
 * evitar CORS e não expor o token em chamadas cross-origin do front.
 *
 * O accessToken é o Personal Access Token do Supabase (dashboard/account/tokens),
 * usado apenas durante a configuração — não é persistido em lugar nenhum.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const { accessToken, projectRef, query } = req.body || {};

    if (!accessToken || !projectRef || !query) {
      res.status(400).json({ error: 'accessToken, projectRef e query são obrigatórios' });
      return;
    }

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    );

    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        `Erro ${response.status} ao executar SQL no Supabase`;
      res.status(response.status).json({ error: message });
      return;
    }

    res.status(200).json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Falha inesperada no provisionamento' });
  }
}
