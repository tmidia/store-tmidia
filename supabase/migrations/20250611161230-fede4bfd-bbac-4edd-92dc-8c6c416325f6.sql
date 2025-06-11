
-- Inserir categorias padrão de varejo
INSERT INTO public.categories (name, description) VALUES
  ('Eletrônicos', 'Produtos eletrônicos e tecnologia'),
  ('Roupas e Acessórios', 'Vestuário, calçados e acessórios'),
  ('Casa e Jardim', 'Produtos para casa, decoração e jardim'),
  ('Saúde e Beleza', 'Cosméticos, perfumes e produtos de higiene'),
  ('Esportes e Lazer', 'Artigos esportivos e equipamentos de lazer'),
  ('Livros e Mídia', 'Livros, revistas, filmes e música'),
  ('Alimentação', 'Alimentos, bebidas e suplementos'),
  ('Automóveis', 'Peças e acessórios para veículos'),
  ('Móveis', 'Móveis e decoração para casa'),
  ('Ferramentas', 'Ferramentas e equipamentos'),
  ('Brinquedos', 'Brinquedos e jogos infantis'),
  ('Pet Shop', 'Produtos para animais de estimação'),
  ('Informática', 'Computadores, periféricos e acessórios'),
  ('Telefonia', 'Celulares, telefones e acessórios'),
  ('Eletrodomésticos', 'Aparelhos elétricos para casa')
ON CONFLICT (name) DO NOTHING;

-- Atualizar tabela de fornecedores para incluir mais campos
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;
