
-- Create attendances table
CREATE TABLE public.attendances (
  id TEXT PRIMARY KEY,
  team TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Em andamento', 'Finalizado')),
  responsible TEXT NOT NULL,
  open_date DATE NOT NULL DEFAULT CURRENT_DATE,
  close_date DATE NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Baixa', 'Média', 'Alta')),
  ticks_completed INTEGER NOT NULL DEFAULT 0,
  total_ticks INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an internal IT dashboard)
CREATE POLICY "Allow all operations on attendances" ON public.attendances
FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_attendances_updated_at 
    BEFORE UPDATE ON public.attendances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.attendances (id, team, status, responsible, open_date, close_date, priority, ticks_completed, total_ticks, description) VALUES
('AT001', 'São Paulo', 'Finalizado', 'Junior', '2024-08-01', '2024-08-02', 'Alta', 8, 10, 'Configuração de rede corporativa'),
('AT002', 'Sul', 'Em andamento', 'Wellington', '2024-08-03', NULL, 'Média', 5, 8, 'Instalação de software especializado'),
('AT003', 'Cuiabá', 'Pendente', 'José', '2024-08-04', NULL, 'Baixa', 2, 6, 'Manutenção preventiva servidores'),
('AT004', 'Projetos', 'Finalizado', 'Isaque', '2024-08-01', '2024-08-05', 'Alta', 12, 12, 'Implementação novo sistema ERP'),
('AT005', 'São Paulo', 'Em andamento', 'Junior,Wellington', '2024-08-05', NULL, 'Alta', 3, 7, 'Backup e recuperação dados'),
('AT006', 'Sul', 'Finalizado', 'José,Isaque', '2024-07-28', '2024-08-01', 'Média', 6, 6, 'Configuração firewall');