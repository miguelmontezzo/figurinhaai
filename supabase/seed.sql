-- Seed das 980 figurinhas na tabela stickers
-- Execute este script após a migration 001_schema.sql
--
-- ATENÇÃO: Este seed usa uma abordagem simplificada.
-- Para o banco de dados real, execute o script gerado pelo lib/stickers-data.ts
--
-- Seção de apresentação (1-9)
INSERT INTO stickers (number, name, section, section_name, type, description) VALUES
  (1, 'Logo Oficial Copa 2026™', 'apresentacao', 'Apresentação', 'especial', 'Logotipo oficial do torneio'),
  (2, 'Taça FIFA', 'apresentacao', 'Apresentação', 'especial', 'A taça mais cobiçada do futebol'),
  (3, 'Mascote Oficial', 'apresentacao', 'Apresentação', 'especial', 'Mascote do torneio'),
  (4, 'Copa 2026 - Panorama', 'apresentacao', 'Apresentação', 'regular', '48 seleções, 3 países anfitriões'),
  (5, 'Países Anfitriões', 'apresentacao', 'Apresentação', 'especial', 'Estados Unidos, Canadá e México'),
  (6, 'EUA - País Anfitrião', 'apresentacao', 'Apresentação', 'regular', 'United States of America'),
  (7, 'Canadá - País Anfitrião', 'apresentacao', 'Apresentação', 'regular', 'Canada'),
  (8, 'México - País Anfitrião', 'apresentacao', 'Apresentação', 'regular', 'México'),
  (9, 'Programação do Torneio', 'apresentacao', 'Apresentação', 'regular', 'Calendário e formato de competição');

-- As demais figurinhas (10-980) são geradas dinamicamente pelo app
-- Execute o script de seed completo via Next.js API route:
-- POST /api/admin/seed-stickers (apenas em desenvolvimento)
