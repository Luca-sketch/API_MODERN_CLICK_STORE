import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
}

// Rota para buscar endereço pelo CEP
app.get('/cep/:cep', async (req, res) => {
    const cep = req.params.cep;

    try {
        // Fazendo requisição para a API ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            return res.status(404).json({ error: 'CEP não encontrado' });
        }

        // Retornando o endereço
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o CEP' });
    }
});

// Nova rota para calcular a distância e o valor da viagem
app.get('/distancia', async (req, res) => {
    const { lat, lon } = req.query;
    const cepDestino = '01001000';

    try {
        // Fazendo requisição para a API ViaCEP para obter a latitude e longitude do CEP destino
        const response = await fetch(`https://viacep.com.br/ws/${cepDestino}/json/`);
        const data = await response.json();

        if (data.erro) {
            return res.status(404).json({ error: 'CEP destino não encontrado' });
        }

        // Supondo coordenadas para o CEP 01001000 (São Paulo, SP)
        const latDestino = -23.55052;
        const lonDestino = -46.633308;

        // Calculando a distância
        const distancia = haversine(parseFloat(lat), parseFloat(lon), latDestino, lonDestino);

        // Calculando o valor da viagem
        const valorViagem = distancia * 5; // R$5 por km

        // Retornando a distância e o valor da viagem
        res.json({ distancia: distancia.toFixed(2), valor: valorViagem.toFixed(2) });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao calcular a distância' });
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

